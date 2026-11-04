import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  PDF_FIT_WIDTH_LABEL,
  PDF_PAGE_POSITION,
  PDF_VIEWER_LABEL,
  PDF_ZOOM_IN_LABEL,
  PDF_ZOOM_OUT_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'

import { PdfPreview } from './PdfPreview.component'
import { DEFAULT_PAGE_SIZE, MAX_SCALE, MIN_SCALE, fitScaleFor, zoomIn, zoomOut, zoomPercent } from './pdfPreview.utils'

// pdf.js needs a worker and a real canvas, neither of which jsdom has, so the parse boundary is
// mocked. What is under test is which pages get drawn, at what scale, and when drawing stops.
const loadPdf = vi.hoisted(() => vi.fn())
vi.mock('modules/public-document-detail/utils/pdf.ts', () => ({ loadPdf }))

const BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])
const FRAME_WIDTH = 816
const PAGE = { width: 612, height: 792 }

// jsdom does no layout, so the frame's width is whatever this says.
let frameWidth = FRAME_WIDTH

// jsdom has no IntersectionObserver. This one reports only what a test tells it to.
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  readonly observed = new Set<Element>()

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.instances.push(this)
  }

  observe(element: Element) {
    this.observed.add(element)
  }

  unobserve(element: Element) {
    this.observed.delete(element)
  }

  disconnect() {
    this.observed.clear()
  }

  takeRecords() {
    return []
  }

  report(target: Element, isIntersecting: boolean) {
    this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
}

type RenderPage = Mock<(pageNumber: number, canvas: HTMLCanvasElement, options?: { scale?: number; signal?: AbortSignal }) => Promise<unknown>>

const makePdf = (overrides: { firstPageSize?: typeof PAGE; renderPage?: RenderPage } = {}) => ({
  pageCount: 3,
  firstPageSize: PAGE as typeof PAGE | undefined,
  renderPage: vi.fn().mockResolvedValue(PAGE) as RenderPage,
  destroy: vi.fn(),
  ...overrides
})

const calls = (renderPage: RenderPage) =>
  renderPage.mock.calls.map(([page, , options]) => ({ page, scale: options?.scale, signal: options?.signal }))

const lastCall = (renderPage: RenderPage) => {
  const all = calls(renderPage)
  return all[all.length - 1]
}

const pageElement = (pageNumber: number) => screen.getByRole('img', { name: PDF_PAGE_POSITION(pageNumber, 3) })

const observer = () => FakeIntersectionObserver.instances[FakeIntersectionObserver.instances.length - 1]

const report = (pageNumber: number, isIntersecting: boolean) =>
  act(() => {
    observer().report(pageElement(pageNumber), isIntersecting)
  })

const renderPreview = async (pdf: ReturnType<typeof makePdf>) => {
  loadPdf.mockResolvedValue(pdf)
  render(<PdfPreview bytes={BYTES} onUnreadable={vi.fn()} />)
  await screen.findByRole('img', { name: PDF_PAGE_POSITION(1, pdf.pageCount) })
}

describe('PdfPreview', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    frameWidth = FRAME_WIDTH
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => frameWidth })
    loadPdf.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth')
  })

  it('lays every page out in one scrolling frame, labelled by position', async () => {
    await renderPreview(makePdf())

    const frame = screen.getByRole('region', { name: PDF_VIEWER_LABEL })
    const pages = within(frame).getAllByRole('img')
    expect(pages.map((page) => page.getAttribute('aria-label'))).toEqual([1, 2, 3].map((n) => PDF_PAGE_POSITION(n, 3)))
  })

  it('draws only the pages that are in or near view', async () => {
    const pdf = makePdf()
    await renderPreview(pdf)

    // Identity, not deep equality: a matcher that walks a live DOM element never finishes.
    expect(observer().options?.root).toBe(screen.getByRole('region', { name: PDF_VIEWER_LABEL }))
    expect(observer().options?.rootMargin).toBe('100% 0px')
    expect(observer().observed.size).toBe(3)
    expect(pdf.renderPage).not.toHaveBeenCalled()

    report(1, true)
    await waitFor(() => expect(calls(pdf.renderPage).map((call) => call.page)).toEqual([1]))

    report(3, true)
    await waitFor(() => expect(calls(pdf.renderPage).map((call) => call.page)).toEqual([1, 3]))
  })

  it('frees a page that leaves the view and stops drawing it', async () => {
    const pdf = makePdf({ renderPage: vi.fn(() => new Promise(() => {})) as RenderPage })
    await renderPreview(pdf)

    report(1, true)
    await waitFor(() => expect(pdf.renderPage).toHaveBeenCalledTimes(1))
    const canvas = pageElement(1).querySelector('canvas') as HTMLCanvasElement
    canvas.width = 120
    canvas.height = 160

    report(1, false)

    expect(calls(pdf.renderPage)[0].signal?.aborted).toBe(true)
    expect(pageElement(1).querySelector('canvas')).toBeNull()
    // Shrunk before it was dropped, so WebKit lets go of the bitmap behind it.
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
  })

  it('opens with the page width fitted to the frame', async () => {
    const pdf = makePdf()
    await renderPreview(pdf)

    report(1, true)

    const fit = fitScaleFor(FRAME_WIDTH, PAGE.width)
    await waitFor(() => expect(calls(pdf.renderPage)).toEqual([expect.objectContaining({ page: 1, scale: fit })]))
    expect(screen.getByText(zoomPercent(fit))).toBeInTheDocument()
  })

  it('zooms in and out in steps, redrawing what is in view, and stops at the limits', async () => {
    const user = userEvent.setup()
    const pdf = makePdf()
    await renderPreview(pdf)
    report(1, true)
    const fit = fitScaleFor(FRAME_WIDTH, PAGE.width)

    await user.click(screen.getByRole('button', { name: PDF_ZOOM_IN_LABEL }))
    await waitFor(() => expect(lastCall(pdf.renderPage)).toMatchObject({ page: 1, scale: zoomIn(fit) }))
    expect(screen.getByText(zoomPercent(zoomIn(fit)))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: PDF_ZOOM_OUT_LABEL }))
    await waitFor(() => expect(lastCall(pdf.renderPage)?.scale).toBeCloseTo(zoomOut(zoomIn(fit)), 10))

    const zoomInButton = screen.getByRole('button', { name: PDF_ZOOM_IN_LABEL })
    for (let step = 0; step < 20 && !zoomInButton.hasAttribute('disabled'); step += 1) await user.click(zoomInButton)
    expect(zoomInButton).toBeDisabled()
    expect(screen.getByText(zoomPercent(MAX_SCALE))).toBeInTheDocument()

    const zoomOutButton = screen.getByRole('button', { name: PDF_ZOOM_OUT_LABEL })
    for (let step = 0; step < 20 && !zoomOutButton.hasAttribute('disabled'); step += 1) await user.click(zoomOutButton)
    expect(zoomOutButton).toBeDisabled()
    expect(screen.getByText(zoomPercent(MIN_SCALE))).toBeInTheDocument()
  })

  it('returns to the fitted width on "Fit width"', async () => {
    const user = userEvent.setup()
    const pdf = makePdf()
    await renderPreview(pdf)
    report(1, true)
    const fit = fitScaleFor(FRAME_WIDTH, PAGE.width)

    await user.click(screen.getByRole('button', { name: PDF_ZOOM_IN_LABEL }))
    await waitFor(() => expect(lastCall(pdf.renderPage)?.scale).toBe(zoomIn(fit)))
    expect(screen.getByRole('button', { name: PDF_FIT_WIDTH_LABEL })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: PDF_FIT_WIDTH_LABEL }))

    await waitFor(() => expect(lastCall(pdf.renderPage)?.scale).toBe(fit))
    expect(screen.getByRole('button', { name: PDF_FIT_WIDTH_LABEL })).toHaveAttribute('aria-pressed', 'true')
  })

  it('stops drawing at the old zoom when the zoom changes', async () => {
    const user = userEvent.setup()
    const pdf = makePdf({ renderPage: vi.fn(() => new Promise(() => {})) as RenderPage })
    await renderPreview(pdf)
    report(1, true)
    await waitFor(() => expect(pdf.renderPage).toHaveBeenCalledTimes(1))

    await user.click(screen.getByRole('button', { name: PDF_ZOOM_IN_LABEL }))

    await waitFor(() => expect(pdf.renderPage).toHaveBeenCalledTimes(2))
    const [first, second] = calls(pdf.renderPage)
    expect(first.signal?.aborted).toBe(true)
    expect(second.signal?.aborted).toBe(false)
  })

  it('refits when the window is resized, but keeps a zoom the user chose', async () => {
    const user = userEvent.setup()
    const pdf = makePdf()
    await renderPreview(pdf)
    report(1, true)

    frameWidth = 1016
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    const wider = fitScaleFor(1016, PAGE.width)
    await waitFor(() => expect(lastCall(pdf.renderPage)?.scale).toBe(wider))

    await user.click(screen.getByRole('button', { name: PDF_ZOOM_IN_LABEL }))
    await waitFor(() => expect(lastCall(pdf.renderPage)?.scale).toBe(zoomIn(wider)))

    frameWidth = 616
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByText(zoomPercent(zoomIn(wider)))).toBeInTheDocument()
    expect(lastCall(pdf.renderPage)?.scale).toBe(zoomIn(wider))
  })

  it('keeps a page at its own size after it leaves the view', async () => {
    const pdf = makePdf({ renderPage: vi.fn(async (pageNumber: number) => (pageNumber === 2 ? { width: 400, height: 300 } : PAGE)) as RenderPage })
    await renderPreview(pdf)
    const fit = fitScaleFor(FRAME_WIDTH, PAGE.width)

    report(2, true)
    await waitFor(() => expect(pageElement(2)).toHaveStyle({ width: `${Math.round(400 * fit)}px` }))

    report(2, false)

    expect(pageElement(2)).toHaveStyle({ width: `${Math.round(400 * fit)}px`, height: `${Math.round(300 * fit)}px` })
    expect(pageElement(1)).toHaveStyle({ width: `${Math.round(PAGE.width * fit)}px` })
  })

  it('draws every page where IntersectionObserver is not available', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const pdf = makePdf()
    await renderPreview(pdf)

    await waitFor(() => expect(calls(pdf.renderPage).map((call) => call.page).sort()).toEqual([1, 2, 3]))
  })

  it('still draws pages, at scale 1, when the page size is unknown', async () => {
    const pdf = makePdf({ firstPageSize: undefined })
    await renderPreview(pdf)

    report(1, true)
    report(2, true)

    await waitFor(() => expect(calls(pdf.renderPage)).toEqual([expect.objectContaining({ page: 1, scale: 1 }), expect.objectContaining({ page: 2, scale: 1 })]))
    expect(pageElement(3)).toHaveStyle({ width: `${DEFAULT_PAGE_SIZE.width}px`, height: `${DEFAULT_PAGE_SIZE.height}px` })
    expect(screen.getByText(zoomPercent(1))).toBeInTheDocument()
  })

  it('ignores what the observer of the previous document reports once the file has changed', async () => {
    const first = makePdf()
    const second = makePdf()
    loadPdf.mockResolvedValueOnce(first).mockResolvedValueOnce(second)
    const onUnreadable = vi.fn()
    const { rerender } = render(<PdfPreview bytes={BYTES} onUnreadable={onUnreadable} />)
    await screen.findByRole('img', { name: PDF_PAGE_POSITION(1, 3) })
    const firstObserver = observer()
    const firstDocumentPage = pageElement(1)

    rerender(<PdfPreview bytes={new Uint8Array(BYTES)} onUnreadable={onUnreadable} />)
    await waitFor(() => expect(FakeIntersectionObserver.instances.length).toBe(2))

    // An entry the old observer had already queued arrives after the switch.
    act(() => {
      firstObserver.report(firstDocumentPage, true)
    })

    expect(second.renderPage).not.toHaveBeenCalled()
  })

  it('reports a PDF that will not parse and shows no pages', async () => {
    loadPdf.mockResolvedValue(null)
    const onUnreadable = vi.fn()

    render(<PdfPreview bytes={BYTES} onUnreadable={onUnreadable} />)

    await waitFor(() => expect(onUnreadable).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('img')).toBeNull()
  })
})

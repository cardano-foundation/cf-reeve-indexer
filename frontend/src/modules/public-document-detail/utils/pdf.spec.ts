import { afterEach, describe, expect, it, vi } from 'vitest'

import { MAX_CANVAS_PIXELS, loadPdf, renderRatio } from './pdf'

// A stand-in for pdf.js whose document never opens, the way it fails when its worker cannot start.
// The worker source is preset, so loadPdf skips importing the real worker file.
const pdfjs = vi.hoisted(() => ({
  GlobalWorkerOptions: { workerSrc: '/assets/pdf.worker.mjs' },
  getDocument: vi.fn()
}))
vi.mock('pdfjs-dist', () => pdfjs)

// pdf.js itself is not loaded here (it needs a worker and a real canvas); only the resolution
// arithmetic that decides how large a page's canvas may get.
describe('renderRatio', () => {
  it('is the per-canvas pixel limit of iOS Safari', () => {
    expect(MAX_CANVAS_PIXELS).toBe(16_777_216)
  })

  it('uses the device pixel ratio while it is small', () => {
    expect(renderRatio(612, 792, 1)).toBe(1)
    expect(renderRatio(612, 792, 1.5)).toBe(1.5)
  })

  it('caps the ratio at 2', () => {
    expect(renderRatio(612, 792, 3)).toBe(2)
  })

  it('lowers the ratio so a large zoomed page stays within the canvas pixel limit', () => {
    const width = 612 * 4
    const height = 792 * 4

    const ratio = renderRatio(width, height, 2)

    expect(ratio).toBeLessThan(2)
    expect(Math.floor(width * ratio) * Math.floor(height * ratio)).toBeLessThanOrEqual(MAX_CANVAS_PIXELS)
  })

  it('treats a missing device pixel ratio as 1', () => {
    expect(renderRatio(612, 792, 0)).toBe(1)
  })

  it.each([
    [Number.NaN, 792],
    [0, 0],
    [612, Number.POSITIVE_INFINITY]
  ])('returns 1 for a page of %s × %s', (width, height) => {
    expect(renderRatio(width, height, 2)).toBe(1)
  })
})

describe('loadPdf when pdf.js cannot open the document', () => {
  const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])
  const workerFailure = new Error('Setting up fake worker failed: "Failed to fetch dynamically imported module"')

  afterEach(() => {
    vi.restoreAllMocks()
    pdfjs.getDocument.mockReset()
  })

  it('says in the console why, instead of failing silently', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    pdfjs.getDocument.mockReturnValue({ promise: Promise.reject(workerFailure), destroy: vi.fn().mockResolvedValue(undefined) })

    await expect(loadPdf(PDF)).resolves.toBeNull()

    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('PDF'), workerFailure)
  })

  it('tears down what pdf.js started, even when that teardown fails too', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const teardown = Promise.reject(new Error('Worker was terminated'))
    // .catch(f) and .then(_, f) both go through then(): a second argument means the failure is
    // handled. This test run does not reliably surface an unhandled rejection, so it is checked here.
    const then = vi.spyOn(teardown, 'then')
    const destroy = vi.fn().mockReturnValue(teardown)
    pdfjs.getDocument.mockReturnValue({ promise: Promise.reject(workerFailure), destroy })

    await expect(loadPdf(PDF)).resolves.toBeNull()

    expect(destroy).toHaveBeenCalledTimes(1)
    expect(then).toHaveBeenCalledWith(undefined, expect.any(Function))
    // Keep a failing run from leaving the rejection unhandled itself.
    teardown.catch(() => undefined)
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DECRYPT_VIEWER_BINARY_MESSAGE,
  DECRYPT_VIEWER_IMAGE_ALT,
  DECRYPT_VIEWER_PDF_UNREADABLE_MESSAGE,
  DECRYPT_VIEWER_UNVERIFIED_MESSAGE
} from 'modules/public-document-detail/constants/detail.consts.ts'

import { DocumentViewer } from './DocumentViewer.component'

// pdf.js needs a worker and a real canvas, neither of which jsdom provides, so the parse boundary is
// mocked. What is under test here is how the viewer REACTS to a parse succeeding or failing.
const loadPdf = vi.hoisted(() => vi.fn())
vi.mock('modules/public-document-detail/utils/pdf.ts', () => ({ loadPdf }))

const utf8 = (s: string) => new TextEncoder().encode(s)
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])

describe('DocumentViewer', () => {
  beforeEach(() => {
    // jsdom has no blob-URL support; the image branch needs it. Stub it.
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
    loadPdf.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('previews UTF-8 text inline', () => {
    render(<DocumentViewer bytes={utf8('hello preview')} plaintextHashMatches />)
    expect(screen.getByText('hello preview')).toBeInTheDocument()
  })

  it('pretty-prints JSON inline', () => {
    render(<DocumentViewer bytes={utf8('{"a":1}')} plaintextHashMatches />)
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument()
  })

  it('renders an image element from a blob URL', () => {
    // PNG magic bytes
    render(<DocumentViewer bytes={new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])} plaintextHashMatches />)
    const img = screen.getByAltText(DECRYPT_VIEWER_IMAGE_ALT) as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toBe('blob:mock-url')
  })

  it('shows a download-only message for binary content', () => {
    render(<DocumentViewer bytes={new Uint8Array([0xff, 0xfe, 0x00, 0x01])} plaintextHashMatches />)
    expect(screen.getByText(DECRYPT_VIEWER_BINARY_MESSAGE)).toBeInTheDocument()
  })

  it('renders a parsed PDF onto a canvas with no iframe involved', async () => {
    const renderPage = vi.fn().mockResolvedValue(undefined)
    loadPdf.mockResolvedValue({ pageCount: 3, renderPage, destroy: vi.fn() })

    const { container } = render(<DocumentViewer bytes={PDF} plaintextHashMatches />)

    await waitFor(() => expect(renderPage).toHaveBeenCalled())
    expect(container.querySelector('canvas')).not.toBeNull()
    // The PDF is decoded in-process and painted as pixels; it is never handed to a browser plugin
    // or a nested browsing context that could execute anything.
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText(/3 pages/)).toBeInTheDocument()
  })

  it('offers download only when the bytes claim to be a PDF but will not parse', async () => {
    loadPdf.mockResolvedValue(null)

    render(<DocumentViewer bytes={PDF} plaintextHashMatches />)

    expect(await screen.findByText(DECRYPT_VIEWER_PDF_UNREADABLE_MESSAGE)).toBeInTheDocument()
  })

  it('suppresses the preview entirely when the plaintext hash does NOT match (never renders unverified bytes)', () => {
    render(<DocumentViewer bytes={PDF} plaintextHashMatches={false} />)
    expect(screen.getByText(DECRYPT_VIEWER_UNVERIFIED_MESSAGE)).toBeInTheDocument()
    // Unverified bytes never reach a parser or a blob URL at all.
    expect(loadPdf).not.toHaveBeenCalled()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})

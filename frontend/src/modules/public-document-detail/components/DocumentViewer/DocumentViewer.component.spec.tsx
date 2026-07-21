import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DECRYPT_VIEWER_BINARY_MESSAGE,
  DECRYPT_VIEWER_IMAGE_ALT,
  DECRYPT_VIEWER_PDF_SHOW,
  DECRYPT_VIEWER_UNVERIFIED_MESSAGE
} from 'modules/public-document-detail/constants/detail.consts.ts'

import { DocumentViewer } from './DocumentViewer.component'

const utf8 = (s: string) => new TextEncoder().encode(s)
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])

describe('DocumentViewer', () => {
  beforeEach(() => {
    // jsdom has no blob-URL support; the image/pdf branches need it. Stub it.
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
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

  it('renders the PDF in a fully locked-down sandboxed iframe (no allow-scripts / allow-same-origin)', () => {
    const { container } = render(<DocumentViewer bytes={PDF} plaintextHashMatches />)
    // The PDF is gated behind an explicit click.
    fireEvent.click(screen.getByRole('button', { name: DECRYPT_VIEWER_PDF_SHOW }))
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe).toHaveAttribute('sandbox', '')
    // An empty sandbox attribute grants NO tokens: no scripts, opaque origin.
    expect(iframe!.getAttribute('sandbox')).not.toContain('allow-scripts')
    expect(iframe!.getAttribute('sandbox')).not.toContain('allow-same-origin')
  })

  it('suppresses the preview entirely when the plaintext hash does NOT match (never renders unverified bytes)', () => {
    render(<DocumentViewer bytes={PDF} plaintextHashMatches={false} />)
    expect(screen.getByText(DECRYPT_VIEWER_UNVERIFIED_MESSAGE)).toBeInTheDocument()
    // No preview affordance at all — not even the PDF "show" button — and no blob URL created.
    expect(screen.queryByRole('button', { name: DECRYPT_VIEWER_PDF_SHOW })).toBeNull()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})

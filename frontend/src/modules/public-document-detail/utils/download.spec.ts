import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { saveDecryptedFile } from './download'

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])

describe('saveDecryptedFile', () => {
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL
  let blobs: Blob[]
  let clicked: Array<{ download: string; href: string }>

  beforeEach(() => {
    blobs = []
    clicked = []
    // jsdom has no blob URLs and does not navigate on click; record what would have been saved.
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob)
      return 'blob:mock-url'
    })
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push({ download: this.download, href: this.href })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  })

  it('names and types a verified PDF as a PDF', () => {
    saveDecryptedFile('doc-1', { plaintext: PDF, plaintextHashMatches: true })

    expect(clicked).toEqual([{ download: 'document-doc-1.pdf', href: 'blob:mock-url' }])
    expect(blobs[0].type).toBe('application/pdf')
    expect(blobs[0].size).toBe(PDF.length)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    expect(document.querySelector('a[download]')).toBeNull()
  })

  it('keeps .bin for bytes that do not match the on-chain plaintext hash, whatever they look like', () => {
    saveDecryptedFile('doc-1', { plaintext: PDF, plaintextHashMatches: false })

    expect(clicked[0].download).toBe('document-doc-1.bin')
    expect(blobs[0].type).toBe('application/octet-stream')
  })

  it('names a verified file of unknown type .bin', () => {
    saveDecryptedFile('doc-1', { plaintext: new Uint8Array([0xff, 0xfe, 0x00, 0x01]), plaintextHashMatches: true })

    expect(clicked[0].download).toBe('document-doc-1.bin')
    expect(blobs[0].type).toBe('application/octet-stream')
  })
})

import { describe, expect, it } from 'vitest'

import { detectContent } from './content'

const bytes = (...values: number[]) => new Uint8Array(values)
const utf8 = (s: string) => new TextEncoder().encode(s)

describe('detectContent', () => {
  it('detects a PDF by its %PDF magic', () => {
    expect(detectContent(bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37))).toEqual({ kind: 'pdf' })
  })

  it('detects a PNG image', () => {
    expect(detectContent(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00))).toEqual({
      kind: 'image',
      mediaType: 'image/png'
    })
  })

  it('detects a JPEG image', () => {
    expect(detectContent(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00))).toEqual({ kind: 'image', mediaType: 'image/jpeg' })
  })

  it('detects a WebP image via the RIFF/WEBP framing', () => {
    const webp = bytes(0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50)
    expect(detectContent(webp)).toEqual({ kind: 'image', mediaType: 'image/webp' })
  })

  it('detects and pretty-prints JSON', () => {
    const result = detectContent(utf8('{"b":2,"a":1}'))
    expect(result.kind).toBe('json')
    expect(result.kind === 'json' && result.text).toBe('{\n  "b": 2,\n  "a": 1\n}')
  })

  it('treats JSON-looking but invalid content as plain text', () => {
    const result = detectContent(utf8('{ not valid json }'))
    expect(result.kind).toBe('text')
  })

  it('detects UTF-8 text (including multibyte)', () => {
    const result = detectContent(utf8('héllo, world — café'))
    expect(result).toEqual({ kind: 'text', text: 'héllo, world — café' })
  })

  it('treats invalid UTF-8 as binary', () => {
    // 0xff 0xfe is not valid UTF-8
    expect(detectContent(bytes(0xff, 0xfe, 0x00, 0x01))).toEqual({ kind: 'binary' })
  })

  it('treats valid-UTF-8-but-control-char-laden bytes as binary', () => {
    // NUL byte in otherwise-decodable content signals binary, not text.
    expect(detectContent(bytes(0x68, 0x69, 0x00, 0x01, 0x02))).toEqual({ kind: 'binary' })
  })

  it('allows tab/newline/carriage-return in text', () => {
    const result = detectContent(utf8('line1\n\tline2\r\n'))
    expect(result.kind).toBe('text')
  })
})

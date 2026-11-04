import { describe, expect, it } from 'vitest'

import { detectContent, downloadTypeOf } from './content'

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

// Builds a minimal but well-formed ZIP: local headers, central directory, end-of-central-directory
// record. CRCs are zero — nothing here validates them.
const u16 = (value: number) => [value & 0xff, (value >>> 8) & 0xff]
const u32 = (value: number) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff]

const makeZip = (entries: Array<{ name: string; data?: Uint8Array }>, { comment = new Uint8Array() }: { comment?: Uint8Array } = {}) => {
  const body: number[] = []
  const central: number[] = []
  for (const { name, data = new Uint8Array() } of entries) {
    const nameBytes = [...utf8(name)]
    const localOffset = body.length
    // Local file header: signature, version, flags, method, time, date, crc, sizes, name/extra lengths.
    body.push(0x50, 0x4b, 0x03, 0x04, ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0))
    body.push(...u32(0), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0))
    body.push(...nameBytes, ...data)
    // Central directory header: as above plus made-by, comment length, disk, attributes, local offset.
    central.push(0x50, 0x4b, 0x01, 0x02, ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0))
    central.push(...u32(0), ...u32(data.length), ...u32(data.length))
    central.push(...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(localOffset))
    central.push(...nameBytes)
  }
  const centralOffset = body.length
  const end = [0x50, 0x4b, 0x05, 0x06, ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length)]
  end.push(...u32(central.length), ...u32(centralOffset), ...u16(comment.length))
  return new Uint8Array([...body, ...central, ...end, ...comment])
}

const officeZip = (mainPart: string) => makeZip([{ name: '[Content_Types].xml' }, { name: '_rels/.rels' }, { name: mainPart }])

describe('downloadTypeOf', () => {
  it.each([
    ['a PDF', bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37), 'pdf', 'application/pdf'],
    ['a PNG', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00), 'png', 'image/png'],
    ['a JPEG', bytes(0xff, 0xd8, 0xff, 0xe0, 0x00), 'jpg', 'image/jpeg'],
    ['a GIF', bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61), 'gif', 'image/gif'],
    ['a WebP', bytes(0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50), 'webp', 'image/webp'],
    ['JSON', utf8('{"a":1}'), 'json', 'application/json'],
    ['plain text', utf8('quarterly figures'), 'txt', 'text/plain'],
    ['unrecognised bytes', bytes(0xff, 0xfe, 0x00, 0x01), 'bin', 'application/octet-stream']
  ])('types %s as .%s', (_label, input, extension, mediaType) => {
    expect(downloadTypeOf(input)).toEqual({ extension, mediaType })
  })

  it.each([
    ['word/document.xml', 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['xl/workbook.xml', 'xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['ppt/presentation.xml', 'pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
  ])('types an Office zip whose central directory lists %s as .%s', (mainPart, extension, mediaType) => {
    expect(downloadTypeOf(officeZip(mainPart))).toEqual({ extension, mediaType })
  })

  it('types any other zip as .zip', () => {
    expect(downloadTypeOf(makeZip([{ name: 'ledger.csv', data: utf8('a,b\n1,2\n') }]))).toEqual({ extension: 'zip', mediaType: 'application/zip' })
  })

  it('types a zip that merely CONTAINS a stored .docx as .zip', () => {
    // The inner document's own entry names sit uncompressed inside the outer archive's data. Only the
    // outer archive's table of contents counts.
    const archive = makeZip([{ name: 'reports/q3.docx', data: officeZip('word/document.xml') }])
    expect(downloadTypeOf(archive)).toEqual({ extension: 'zip', mediaType: 'application/zip' })
  })

  it('still finds the table of contents behind a long archive comment', () => {
    const archive = makeZip([{ name: '[Content_Types].xml' }, { name: 'xl/workbook.xml' }], { comment: new Uint8Array(60_000).fill(0x20) })
    expect(downloadTypeOf(archive).extension).toBe('xlsx')
  })

  it('ignores an end-of-directory signature planted inside the comment', () => {
    const planted = new Uint8Array([0x50, 0x4b, 0x05, 0x06, ...new Uint8Array(30).fill(0xee)])
    expect(downloadTypeOf(makeZip([{ name: 'word/document.xml' }], { comment: planted })).extension).toBe('docx')
  })

  it('falls back to .zip, without throwing, for a truncated archive', () => {
    expect(downloadTypeOf(bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00))).toEqual({ extension: 'zip', mediaType: 'application/zip' })
  })

  it('falls back to .zip, without throwing, when the directory offset points outside the file', () => {
    const archive = officeZip('word/document.xml')
    // Central-directory offset lives 16 bytes into the 22-byte end record.
    new DataView(archive.buffer).setUint32(archive.length - 22 + 16, 0x7fff_ffff, true)
    expect(downloadTypeOf(archive)).toEqual({ extension: 'zip', mediaType: 'application/zip' })
  })
})

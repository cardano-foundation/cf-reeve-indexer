/**
 * Content sniffing for the in-browser document viewer. The bytes are the DECRYPTED plaintext, so
 * they are only ever the user's own document — but we still classify by magic bytes / UTF-8 shape
 * (never by any attacker-supplied filename or MIME, of which there is none: I10) and fall back to a
 * plain download for anything we can't safely render inline.
 */

export type DetectedContent =
  | { kind: 'pdf' }
  | { kind: 'image'; mediaType: string }
  | { kind: 'json'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'binary' }

// Above this size we don't attempt an inline text preview — the download path handles big files.
const MAX_TEXT_PREVIEW_BYTES = 1024 * 1024

const startsWith = (bytes: Uint8Array, magic: number[]): boolean =>
  bytes.length >= magic.length && magic.every((b, i) => bytes[i] === b)

const detectImage = (bytes: Uint8Array): string | null => {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return 'image/gif'
  // WEBP: "RIFF" .... "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes.subarray(8), [0x57, 0x45, 0x42, 0x50])) return 'image/webp'
  return null
}

// Strict UTF-8 decode; returns null if the bytes are not valid UTF-8 or carry disallowed control
// characters (a strong signal of binary content that merely happens to be valid UTF-8).
const tryDecodeText = (bytes: Uint8Array): string | null => {
  if (bytes.length > MAX_TEXT_PREVIEW_BYTES) return null
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
  // Disallow control chars other than tab / newline / carriage return.
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) return null
  }
  return text
}

export const detectContent = (bytes: Uint8Array): DetectedContent => {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return { kind: 'pdf' } // "%PDF"

  const imageType = detectImage(bytes)
  if (imageType) return { kind: 'image', mediaType: imageType }

  const text = tryDecodeText(bytes)
  if (text !== null) {
    const trimmed = text.trim()
    const looksLikeJson =
      (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))
    if (looksLikeJson) {
      try {
        return { kind: 'json', text: JSON.stringify(JSON.parse(trimmed), null, 2) }
      } catch {
        // Not actually JSON — fall through to plain text.
      }
    }
    return { kind: 'text', text }
  }

  return { kind: 'binary' }
}

export type DownloadType = { extension: string; mediaType: string }

export const UNKNOWN_DOWNLOAD_TYPE: DownloadType = { extension: 'bin', mediaType: 'application/octet-stream' }

const ZIP_TYPE: DownloadType = { extension: 'zip', mediaType: 'application/zip' }

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp'
}

// Office Open XML files are zips; each format has one main part under a fixed default name.
const OFFICE_MAIN_PARTS: Array<{ part: string; type: DownloadType }> = [
  { part: 'word/document.xml', type: { extension: 'docx', mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } },
  { part: 'xl/workbook.xml', type: { extension: 'xlsx', mediaType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } },
  { part: 'ppt/presentation.xml', type: { extension: 'pptx', mediaType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' } }
]

const ZIP_LOCAL_HEADER = [0x50, 0x4b, 0x03, 0x04]
const ZIP_CENTRAL_HEADER = [0x50, 0x4b, 0x01, 0x02]
const ZIP_END_OF_DIRECTORY = [0x50, 0x4b, 0x05, 0x06]
const END_OF_DIRECTORY_SIZE = 22
const MAX_ZIP_COMMENT = 0xffff
const CENTRAL_HEADER_SIZE = 46
const MAX_ZIP_ENTRIES = 10_000

const nameDecoder = new TextDecoder()

// No subarray per call: the end-record scan below tries up to ~64 K positions.
const signatureAt = (bytes: Uint8Array, at: number, signature: number[]): boolean =>
  at + signature.length <= bytes.length && signature.every((b, i) => bytes[at + i] === b)

/**
 * Lists a ZIP's entry names from its central directory — the archive's own table of contents —
 * rather than searching the raw bytes, which would also match names inside a zip stored in this one.
 * Returns null for anything that does not hold together. Every read is bounds-checked: these bytes
 * may be attacker-authored.
 */
const zipEntryNames = (bytes: Uint8Array): string[] | null => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  // The end record sits after the directory, followed only by a comment of up to 64 KiB. Scan back
  // for its signature, and accept a hit only if its comment length reaches exactly to the end of
  // the file — a signature that merely appears inside the comment does not.
  let end = -1
  const lowest = Math.max(0, bytes.length - END_OF_DIRECTORY_SIZE - MAX_ZIP_COMMENT)
  for (let i = bytes.length - END_OF_DIRECTORY_SIZE; i >= lowest; i--) {
    if (signatureAt(bytes, i, ZIP_END_OF_DIRECTORY) && i + END_OF_DIRECTORY_SIZE + view.getUint16(i + 20, true) === bytes.length) {
      end = i
      break
    }
  }
  if (end < 0) return null

  const directorySize = view.getUint32(end + 12, true)
  const directoryOffset = view.getUint32(end + 16, true)
  // The directory must lie before the end record. This also rejects ZIP64 archives, which put
  // 0xFFFFFFFF here and the real values elsewhere.
  if (directoryOffset + directorySize > end) return null

  const names: string[] = []
  let at = directoryOffset
  const directoryEnd = directoryOffset + directorySize
  while (at < directoryEnd && names.length < MAX_ZIP_ENTRIES) {
    if (at + CENTRAL_HEADER_SIZE > directoryEnd || !signatureAt(bytes, at, ZIP_CENTRAL_HEADER)) return null
    const nameLength = view.getUint16(at + 28, true)
    const next = at + CENTRAL_HEADER_SIZE + nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true)
    if (next > directoryEnd) return null
    names.push(nameDecoder.decode(bytes.subarray(at + CENTRAL_HEADER_SIZE, at + CENTRAL_HEADER_SIZE + nameLength)))
    at = next
  }
  return names
}

const zipDownloadType = (bytes: Uint8Array): DownloadType => {
  const names = zipEntryNames(bytes)
  if (!names) return ZIP_TYPE
  return OFFICE_MAIN_PARTS.find(({ part }) => names.includes(part))?.type ?? ZIP_TYPE
}

/**
 * The extension and MIME type to save decrypted bytes under, from the same magic-byte sniff the
 * viewer uses (there is no original filename to go by: it is personally identifying and never
 * published). Office documents and other zips, which the viewer only offers as a download, are
 * told apart by the archive's table of contents. Anything unrecognised stays `.bin`.
 */
export const downloadTypeOf = (bytes: Uint8Array, content: DetectedContent = detectContent(bytes)): DownloadType => {
  switch (content.kind) {
    case 'pdf':
      return { extension: 'pdf', mediaType: 'application/pdf' }
    case 'image':
      return { extension: IMAGE_EXTENSIONS[content.mediaType] ?? 'bin', mediaType: content.mediaType }
    case 'json':
      return { extension: 'json', mediaType: 'application/json' }
    case 'text':
      return { extension: 'txt', mediaType: 'text/plain' }
    case 'binary':
      return startsWith(bytes, ZIP_LOCAL_HEADER) ? zipDownloadType(bytes) : UNKNOWN_DOWNLOAD_TYPE
  }
}

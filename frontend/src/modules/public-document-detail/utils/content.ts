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

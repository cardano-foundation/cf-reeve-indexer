export const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> => {
  if (!/^(?:[0-9a-f]{2})*$/.test(hex)) throw new Error('invalid lowercase hex')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

export const base64ToBytes = (b64: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

// WebAuthn produces credential ids as base64url (no padding, - and _ for + and /). The record's
// credentialId travels in that form; converting it back to bytes is needed to build allowCredentials.
export const base64urlToBytes = (b64url: string): Uint8Array<ArrayBuffer> => {
  const padLength = b64url.length % 4 === 0 ? 0 : 4 - (b64url.length % 4)
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength)
  return base64ToBytes(b64)
}

export const bytesToBase64url = (bytes: Uint8Array): string =>
  bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

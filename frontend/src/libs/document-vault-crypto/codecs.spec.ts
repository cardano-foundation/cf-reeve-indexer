import { describe, expect, it } from 'vitest'

import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes } from './codecs'

describe('codecs', () => {
  it('round-trips hex', () => {
    expect(bytesToHex(hexToBytes('00ff10ab'))).toBe('00ff10ab')
  })

  it('rejects odd-length and non-hex input', () => {
    expect(() => hexToBytes('abc')).toThrow()
    expect(() => hexToBytes('zz')).toThrow()
  })

  it('round-trips base64', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252])
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes)
  })
})

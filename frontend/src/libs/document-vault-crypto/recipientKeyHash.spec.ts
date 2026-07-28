import { describe, expect, it } from 'vitest'

import { PUBLIC_KEY_HEX_REGEX, hashPublicKey } from './recipientKeyHash'

/**
 * These vectors are the RFC 7748 §6.1 X25519 public keys. They are asserted identically in
 * cf-reeve-platform's RecipientKeyHasherTest.java and published in docs/onChainFormat.md. The whole
 * feature rests on the two implementations agreeing — if this file and that one ever disagree, the
 * filter silently matches nothing, which looks like "I have no documents" rather than a bug.
 */
const ALICE_PUB = '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a'
const ALICE_HASH = '300c9c9603b92a4b39ed3958bf9240114804db4fd373012c0ca47432d63425ae'
const BOB_PUB = 'de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f'
const BOB_HASH = 'f35e5616160a30bf3c6e79fa73c576d40205e8fc3ba4e1c6dcf93e6b98e857b4'

describe('hashPublicKey', () => {
  it('matches the golden vectors shared with the platform', async () => {
    await expect(hashPublicKey(ALICE_PUB)).resolves.toBe(ALICE_HASH)
    await expect(hashPublicKey(BOB_PUB)).resolves.toBe(BOB_HASH)
  })

  it('accepts uppercase input and always returns lowercase', async () => {
    // The user pastes whatever their key card shows; the on-chain values are lowercase.
    await expect(hashPublicKey(ALICE_PUB.toUpperCase())).resolves.toBe(ALICE_HASH)
  })

  it('hashes the decoded bytes, not the hex string', async () => {
    // sha256 over the 64-char ASCII hex is a different digest entirely. This is the single most
    // likely reimplementation bug, and it produces something that looks like a valid hash.
    const hash = await hashPublicKey(ALICE_PUB)
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('rejects anything that is not a 32-byte hex key', async () => {
    await expect(hashPublicKey('not-hex')).rejects.toThrow()
    await expect(hashPublicKey('abcd')).rejects.toThrow()
    await expect(hashPublicKey('')).rejects.toThrow()
    await expect(hashPublicKey(`${ALICE_PUB}00`)).rejects.toThrow()
  })

  it('exposes a regex the UI can validate input with before hashing', () => {
    expect(PUBLIC_KEY_HEX_REGEX.test(ALICE_PUB)).toBe(true)
    expect(PUBLIC_KEY_HEX_REGEX.test(ALICE_PUB.toUpperCase())).toBe(true)
    expect(PUBLIC_KEY_HEX_REGEX.test('abcd')).toBe(false)
    expect(PUBLIC_KEY_HEX_REGEX.test(`${ALICE_PUB}00`)).toBe(false)
  })
})

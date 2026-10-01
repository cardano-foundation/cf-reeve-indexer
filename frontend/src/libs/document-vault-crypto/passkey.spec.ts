import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { x25519 } from '@noble/curves/ed25519'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { base64urlToBytes, bytesToHex, hexToBytes } from './codecs'
import { PRF_SALT, X25519_SEED_INFO } from './constants'
import {
  createPasskeyAndDeriveKeypair,
  deriveCardKeyFromExistingPasskey,
  deriveKeypairWithPasskey,
  deriveX25519FromPrf,
  deriveX25519PublicKeyFromPrf,
  evaluatePrf,
  isPasskeySupported
} from './passkey'

const vectorPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../docs/vectors/crypto-kat-v1.json')
const vector = JSON.parse(readFileSync(vectorPath, 'utf-8'))
const kp = vector.passkeyKeypair
const CREDENTIAL_ID = 'dGVzdC1jcmVkZW50aWFsLWlk'

describe('passkey-derived keypair KAT (permissionless card model, shared with Reeve)', () => {
  it('pins PRF_SALT to SHA-256("reeve/document-vault/prf-salt/v1")', () => {
    expect(bytesToHex(PRF_SALT)).toBe('37a30c186dd48cee6d01227a35960275d4c1f243ef8bbc68c53108dc0a7d7eaf')
  })

  it('derives the pinned X25519 keypair from the shared prfOutput (decrypt path)', async () => {
    const { privateKeyHex, publicKeyHex } = await deriveX25519FromPrf(hexToBytes(kp.prfOutputHex))
    expect(privateKeyHex).toBe(kp.privateKeyHex)
    expect(publicKeyHex).toBe(kp.publicKeyHex)
  })

  it('derives ONLY the pinned public key for issuance (no private key materialised)', async () => {
    const publicKeyHex = await deriveX25519PublicKeyFromPrf(hexToBytes(kp.prfOutputHex))
    expect(publicKeyHex).toBe(kp.publicKeyHex)
  })

  it('is deterministic and publicKey equals X25519(privateKey)', async () => {
    const a = await deriveX25519FromPrf(hexToBytes(kp.prfOutputHex))
    const b = await deriveX25519FromPrf(hexToBytes(kp.prfOutputHex))
    expect(a).toEqual(b)
    expect(a.publicKeyHex).toBe(bytesToHex(x25519.getPublicKey(hexToBytes(a.privateKeyHex))))
  })

  it('domain-separates the seed via the HKDF info (different info → different bytes)', async () => {
    const ikm = await crypto.subtle.importKey('raw', hexToBytes(kp.prfOutputHex), 'HKDF', false, ['deriveBits'])
    const bits = async (info: string) =>
      bytesToHex(new Uint8Array(await crypto.subtle.deriveBits(
        { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(info) }, ikm, 256)))
    const seed = await bits(X25519_SEED_INFO)
    const otherInfo = await bits('reeve/document-vault/some-other-domain/v1')
    expect(seed).not.toBe(otherInfo)
    expect(seed).toBe(kp.privateKeyHex) // the seed IS the derived private key
  })
})

describe('passkey WebAuthn wiring (assert / create / re-derive)', () => {
  beforeEach(() => {
    // isPasskeySupported()/isPasskeyRegistrationSupported() gate on these existing; the injected
    // getter/creator replace the real calls (jsdom has no authenticator).
    vi.stubGlobal('PublicKeyCredential', class {})
    Object.defineProperty(navigator, 'credentials', {
      value: { get: vi.fn(), create: vi.fn() },
      configurable: true
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  const fakeAssertion = (prfOutputHex: string, credentialId: string) =>
    ({
      rawId: base64urlToBytes(credentialId).buffer,
      getClientExtensionResults: () => ({ prf: { results: { first: hexToBytes(prfOutputHex).buffer } } })
    }) as unknown as PublicKeyCredential

  const fakeCreated = (credentialId: string, prfOutputHex?: string) =>
    ({
      rawId: base64urlToBytes(credentialId).buffer,
      getClientExtensionResults: () =>
        prfOutputHex ? { prf: { results: { first: hexToBytes(prfOutputHex).buffer } } } : {}
    }) as unknown as PublicKeyCredential

  it('reports passkeys as supported once the globals exist', () => {
    expect(isPasskeySupported()).toBe(true)
  })

  it('evaluatePrf sends PRF_SALT and leaves allowCredentials empty when no credentialId is known', async () => {
    const getCredential = vi.fn().mockResolvedValue(fakeAssertion(kp.prfOutputHex, CREDENTIAL_ID))
    await evaluatePrf(undefined, getCredential)
    const options = getCredential.mock.calls[0][0].publicKey
    expect(bytesToHex(new Uint8Array(options.extensions.prf.eval.first))).toBe(bytesToHex(PRF_SALT))
    expect(options.allowCredentials).toEqual([])
  })

  it('evaluatePrf throws a clear error when the passkey returns no PRF result', async () => {
    const getCredential = vi.fn().mockResolvedValue({
      rawId: base64urlToBytes(CREDENTIAL_ID).buffer,
      getClientExtensionResults: () => ({})
    } as unknown as PublicKeyCredential)
    await expect(evaluatePrf(undefined, getCredential)).rejects.toThrow('did not return a PRF result')
  })

  it('evaluatePrf throws when the assertion is cancelled (null credential)', async () => {
    await expect(evaluatePrf(undefined, vi.fn().mockResolvedValue(null))).rejects.toThrow('cancelled')
  })

  it('issuance: creates a passkey with PRF eval and derives the pinned keypair in one gesture', async () => {
    const createCredential = vi.fn().mockResolvedValue(fakeCreated(CREDENTIAL_ID, kp.prfOutputHex))

    const result = await createPasskeyAndDeriveKeypair({ name: 'bob', displayName: 'Bob' }, createCredential)

    expect(result.publicKeyHex).toBe(kp.publicKeyHex)
    // Issuance NEVER materialises the private key — only the public half + credential id.
    expect(result).not.toHaveProperty('privateKeyHex')
    expect(result.credentialId).toBe(CREDENTIAL_ID)
    // The PRF eval salt sent at creation is exactly PRF_SALT.
    const opts = createCredential.mock.calls[0][0].publicKey
    expect(bytesToHex(new Uint8Array(opts.extensions.prf.eval.first))).toBe(bytesToHex(PRF_SALT))
  })

  it('issuance: falls back to a follow-up assertion when creation returns no PRF result', async () => {
    const createCredential = vi.fn().mockResolvedValue(fakeCreated(CREDENTIAL_ID, undefined))
    const getCredential = vi.fn().mockResolvedValue(fakeAssertion(kp.prfOutputHex, CREDENTIAL_ID))

    const result = await createPasskeyAndDeriveKeypair(
      { name: 'bob', displayName: 'Bob' }, createCredential, getCredential)

    expect(result.publicKeyHex).toBe(kp.publicKeyHex)
    expect(getCredential).toHaveBeenCalledOnce()
  })

  it('issuance (existing passkey): derives ONLY the pinned public key via an assertion, no private key', async () => {
    const getCredential = vi.fn().mockResolvedValue(fakeAssertion(kp.prfOutputHex, CREDENTIAL_ID))

    const result = await deriveCardKeyFromExistingPasskey(getCredential)

    expect(result.publicKeyHex).toBe(kp.publicKeyHex)
    expect(result.credentialId).toBe(CREDENTIAL_ID)
    // Using an EXISTING passkey for issuance still never materialises the private key.
    expect(result).not.toHaveProperty('privateKeyHex')
    // It runs an assertion (get), NOT a registration (create), and leaves allowCredentials empty so
    // the OS lists the holder's passkeys for this site.
    expect(getCredential).toHaveBeenCalledOnce()
    expect(getCredential.mock.calls[0][0].publicKey.allowCredentials).toEqual([])
  })

  it('decryption: re-derives the SAME keypair from the passkey (no stored record)', async () => {
    const getCredential = vi.fn().mockResolvedValue(fakeAssertion(kp.prfOutputHex, CREDENTIAL_ID))

    const result = await deriveKeypairWithPasskey(undefined, getCredential)

    expect(result.privateKeyHex).toBe(kp.privateKeyHex)
    expect(result.publicKeyHex).toBe(kp.publicKeyHex)
    // Round-trip: the key the decrypt path reconstructs is the key issuance put in the card.
    const issued = await createPasskeyAndDeriveKeypair(
      { name: 'bob', displayName: 'Bob' },
      vi.fn().mockResolvedValue(fakeCreated(CREDENTIAL_ID, kp.prfOutputHex))
    )
    expect(result.publicKeyHex).toBe(issued.publicKeyHex)
  })
})

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { bytesToHex } from './codecs'
import { decryptEnvelope, trialDecryptRecipients } from './decrypt'

const vectorPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../docs/vectors/crypto-kat-v1.json')
const vector = JSON.parse(readFileSync(vectorPath, 'utf-8'))

describe('document-vault crypto KAT (shared with the Reeve frontend)', () => {
  it('decrypts the fixture envelope and verifies the on-chain plaintext hash', async () => {
    const outcome = await decryptEnvelope(vector.recipientPrivateKeyHex, vector.envelope, vector.envelope.plaintext_hash)

    expect(outcome).not.toBeNull()
    expect(bytesToHex(outcome!.plaintext)).toBe(vector.plaintextHex)
    expect(outcome!.plaintextHashHex).toBe(vector.envelope.plaintext_hash)
    expect(outcome!.plaintextHashMatches).toBe(true)
    // Slot 0 is a decoy wrapped to a different key: trial decryption must skip it.
    expect(outcome!.recipientIndex).toBe(1)
  })

  it('returns null for a key that opens no recipient entry', async () => {
    const outcome = await decryptEnvelope(vector.strangerPrivateKeyHex, vector.envelope, vector.envelope.plaintext_hash)
    expect(outcome).toBeNull()
  })

  it('GCM rejects a tampered wrapped_dek instead of yielding a wrong DEK', async () => {
    const tampered = structuredClone(vector.envelope)
    const flipped = tampered.slots[1].wrapped_dek.startsWith('0') ? '1' : '0'
    tampered.slots[1].wrapped_dek = flipped + tampered.slots[1].wrapped_dek.slice(1)
    expect(await trialDecryptRecipients(vector.recipientPrivateKeyHex, tampered.slots)).toBeNull()
  })

  it('skips a recipient entry with malformed ephemeral_pub hex instead of throwing', async () => {
    const corrupted = structuredClone(vector.envelope)
    corrupted.slots[0].ephemeral_pub = 'zz'.repeat(32)
    const outcome = await decryptEnvelope(vector.recipientPrivateKeyHex, corrupted, corrupted.plaintext_hash)
    expect(outcome).not.toBeNull()
    expect(outcome!.recipientIndex).toBe(1)
  })

  it('flags a plaintext-hash mismatch against the on-chain value', async () => {
    const outcome = await decryptEnvelope(vector.recipientPrivateKeyHex, vector.envelope, 'f'.repeat(64))
    expect(outcome!.plaintextHashMatches).toBe(false)
  })

  it('rejects an unknown envelope version', async () => {
    const badVersion = structuredClone(vector.envelope)
    badVersion.version = 2
    await expect(
      decryptEnvelope(vector.recipientPrivateKeyHex, badVersion, vector.envelope.plaintext_hash)
    ).rejects.toThrow('Unsupported envelope version: 2')
  })

  it('rejects an envelope with the wrong type', async () => {
    const badType = structuredClone(vector.envelope)
    badType.type = 'X'
    await expect(
      decryptEnvelope(vector.recipientPrivateKeyHex, badType, vector.envelope.plaintext_hash)
    ).rejects.toThrow('Not a REEVE_ENCRYPTED_DOCUMENT envelope')
  })
})

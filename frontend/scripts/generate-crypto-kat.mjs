// Generates docs/vectors/crypto-kat-v1.json - the shared decrypt KAT for the §2.1 constants.
// Run once from frontend/: node scripts/generate-crypto-kat.mjs
import { webcrypto as crypto } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { x25519 } from '@noble/curves/ed25519'

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
const fromHex = (s) => Uint8Array.from(s.match(/.{2}/g).map((b) => parseInt(b, 16)))
const b64 = (bytes) => Buffer.from(bytes).toString('base64')

const SLOT_KEK_INFO = 'reeve/document-vault/slot-kek/v1'
const ZERO_NONCE = new Uint8Array(12)

// RFC 7748 test keys - deterministic and recognisable as test-only.
const recipientPriv = fromHex('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a')
const decoyPriv = fromHex('5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb')
const ephPrivSlot0 = fromHex('0101010101010101010101010101010101010101010101010101010101010101')
const ephPrivSlot1 = fromHex('0202020202020202020202020202020202020202020202020202020202020202')
const strangerPriv = fromHex('0303030303030303030303030303030303030303030303030303030303030303')
const dek = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f')
const payloadNonce = fromHex('000102030405060708090a0b')
const plaintext = new TextEncoder().encode('REEVE DOCUMENT VAULT CRYPTO KAT v1\n')
const orgId = 'f'.repeat(64)

const deriveSlotKek = async (shared) => {
  const ikm = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(SLOT_KEK_INFO) },
    ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  )
}

const wrapDek = async (ephPriv, recipientPub) => {
  const shared = x25519.getSharedSecret(ephPriv, recipientPub)
  const slotKek = await deriveSlotKek(shared)
  const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ZERO_NONCE }, slotKek, dek)
  return { ephemeral_pub: hex(x25519.getPublicKey(ephPriv)), wrapped_dek: hex(new Uint8Array(wrapped)) }
}

const dekKey = await crypto.subtle.importKey('raw', dek, 'AES-GCM', false, ['encrypt'])
const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: payloadNonce }, dekKey, plaintext))
const contentHash = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', ciphertext)))
const plaintextHash = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', plaintext)))

const vector = {
  description:
    'Shared decrypt KAT for the contract §2.1 constants. Slot 0 is a decoy (different recipient); slot 1 opens with recipientPrivateKeyHex. All keys are RFC 7748 / fixed TEST values.',
  recipientPrivateKeyHex: hex(recipientPriv),
  recipientPublicKeyHex: hex(x25519.getPublicKey(recipientPriv)),
  strangerPrivateKeyHex: hex(strangerPriv),
  plaintextHex: hex(plaintext),
  plaintextUtf8: 'REEVE DOCUMENT VAULT CRYPTO KAT v1\n',
  envelope: {
    version: 1,
    type: 'REEVE_ENCRYPTED_DOCUMENT',
    org_id: orgId,
    content_hash: contentHash,
    plaintext_hash: plaintextHash,
    payload: { ciphertext: b64(ciphertext), nonce: hex(payloadNonce) },
    slots: [await wrapDek(ephPrivSlot0, x25519.getPublicKey(decoyPriv)), await wrapDek(ephPrivSlot1, x25519.getPublicKey(recipientPriv))]
  }
}

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/vectors/crypto-kat-v1.json')
writeFileSync(out, JSON.stringify(vector, null, 2) + '\n')
console.log('pinned', out)

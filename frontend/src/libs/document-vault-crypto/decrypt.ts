import { x25519 } from '@noble/curves/ed25519'

import { base64ToBytes, bytesToHex, hexToBytes } from './codecs'
import { ENVELOPE_TYPE, SLOT_KEK_INFO, SLOT_WRAP_NONCE } from './constants'

export type EnvelopeSlot = {
  ephemeral_pub: string
  wrapped_dek: string
}

export type Envelope = {
  version: number
  type: string
  org_id?: string
  content_hash: string
  plaintext_hash: string
  payload: { ciphertext: string; nonce: string }
  slots: EnvelopeSlot[]
}

export type DecryptOutcome = {
  plaintext: Uint8Array
  slotIndex: number
  plaintextHashHex: string
  plaintextHashMatches: boolean
}

const deriveSlotKek = async (sharedSecret: Uint8Array): Promise<CryptoKey> => {
  // Re-wrap: @noble/curves types its output as Uint8Array<ArrayBufferLike>; WebCrypto's
  // BufferSource requires Uint8Array<ArrayBuffer>. Same bytes, TS 5.7+ generic-buffer typing only.
  const ikmCopy = new Uint8Array(sharedSecret)
  const ikm = await crypto.subtle.importKey('raw', ikmCopy, 'HKDF', false, ['deriveKey'])
  ikmCopy.fill(0) // I1: importKey copies bytes internally, so the local copy can be zeroed once it resolves
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(SLOT_KEK_INFO) },
    ikm,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
}

/** §2.6 step 5: GCM-authenticated trial decryption. The FIRST success is authoritative (I6). */
export const trialDecryptSlots = async (
  privateKeyHex: string,
  slots: EnvelopeSlot[]
): Promise<{ dek: Uint8Array<ArrayBuffer>; slotIndex: number } | null> => {
  const privateKey = hexToBytes(privateKeyHex)
  try {
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      let sharedSecret: Uint8Array | undefined
      try {
        sharedSecret = x25519.getSharedSecret(privateKey, hexToBytes(slots[slotIndex].ephemeral_pub))
        const slotKek = await deriveSlotKek(sharedSecret)
        const dek = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: SLOT_WRAP_NONCE },
          slotKek,
          hexToBytes(slots[slotIndex].wrapped_dek)
        )
        return { dek: new Uint8Array(dek), slotIndex }
      } catch {
        // Wrong or malformed slot: skip - GCM authentication (I6) decides, identifiers never do.
      } finally {
        sharedSecret?.fill(0) // I1: zero the ECDH shared secret on every path (success, failure, exception)
      }
    }
    return null
  } finally {
    privateKey.fill(0) // I1: zero key material after use
  }
}

/** §2.6 steps 5-6 against the on-chain plaintext hash - the one check tying ciphertext to a real file. */
export const decryptEnvelope = async (
  privateKeyHex: string,
  envelope: Envelope,
  onChainPlaintextHashHex: string
): Promise<DecryptOutcome | null> => {
  // I7: an unknown envelope version/type must fail visibly rather than be guessed at.
  if (envelope.version !== 1) {
    throw new Error(`Unsupported envelope version: ${envelope.version}`)
  }
  if (envelope.type !== ENVELOPE_TYPE) {
    throw new Error('Not a REEVE_ENCRYPTED_DOCUMENT envelope')
  }
  const match = await trialDecryptSlots(privateKeyHex, envelope.slots)
  if (!match) return null
  try {
    const dekKey = await crypto.subtle.importKey('raw', match.dek, 'AES-GCM', false, ['decrypt'])
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBytes(envelope.payload.nonce) },
      dekKey,
      base64ToBytes(envelope.payload.ciphertext)
    )
    const plaintext = new Uint8Array(plaintextBuffer)
    const plaintextHashHex = bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', plaintext)))
    return {
      plaintext,
      slotIndex: match.slotIndex,
      plaintextHashHex,
      plaintextHashMatches: plaintextHashHex === onChainPlaintextHashHex
    }
  } catch {
    return null
  } finally {
    match.dek.fill(0) // I1
  }
}

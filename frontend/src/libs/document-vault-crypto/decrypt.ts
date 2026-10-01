import { x25519 } from '@noble/curves/ed25519'

import { base64ToBytes, bytesToHex, hexToBytes } from './codecs'
import { ENVELOPE_TYPE, RECIPIENT_KEK_INFO, RECIPIENT_WRAP_NONCE } from './constants'

/**
 * One recipient's copy of the document key: the document's data-encryption key (DEK) wrapped to that
 * recipient's X25519 public key. An envelope carries one of these per recipient.
 */
export type RecipientEntry = {
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
  /**
   * The published envelope calls the recipient entries "slots". That name is frozen — every
   * envelope already on IPFS uses it — so it survives here, on the type that mirrors the wire
   * shape, and nowhere else. Everything downstream calls them recipients.
   */
  slots: RecipientEntry[]
}

export type DecryptOutcome = {
  plaintext: Uint8Array
  recipientIndex: number
  plaintextHashHex: string
  plaintextHashMatches: boolean
}

const deriveRecipientKek = async (sharedSecret: Uint8Array): Promise<CryptoKey> => {
  // Re-wrap: @noble/curves types its output as Uint8Array<ArrayBufferLike>; WebCrypto's
  // BufferSource requires Uint8Array<ArrayBuffer>. Same bytes, TS 5.7+ generic-buffer typing only.
  const ikmCopy = new Uint8Array(sharedSecret)
  const ikm = await crypto.subtle.importKey('raw', ikmCopy, 'HKDF', false, ['deriveKey'])
  ikmCopy.fill(0) // importKey copies the bytes internally, so this copy can be zeroed once it resolves
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(RECIPIENT_KEK_INFO) },
    ikm,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
}

/**
 * Finds which recipient entry (if any) this private key can open, by trying each in turn.
 *
 * There is no index or identifier saying which entry belongs to whom — that would leak the
 * recipient set to anyone who fetches the envelope. AES-GCM's authentication tag is what decides:
 * the wrong key fails to authenticate, so the first entry that decrypts successfully is by
 * definition the right one.
 */
export const trialDecryptRecipients = async (
  privateKeyHex: string,
  recipients: RecipientEntry[]
): Promise<{ dek: Uint8Array<ArrayBuffer>; recipientIndex: number } | null> => {
  const privateKey = hexToBytes(privateKeyHex)
  try {
    for (let recipientIndex = 0; recipientIndex < recipients.length; recipientIndex++) {
      let sharedSecret: Uint8Array | undefined
      try {
        sharedSecret = x25519.getSharedSecret(privateKey, hexToBytes(recipients[recipientIndex].ephemeral_pub))
        const recipientKek = await deriveRecipientKek(sharedSecret)
        const dek = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: RECIPIENT_WRAP_NONCE },
          recipientKek,
          hexToBytes(recipients[recipientIndex].wrapped_dek)
        )
        return { dek: new Uint8Array(dek), recipientIndex }
      } catch {
        // Not this recipient's entry, or it is malformed. Either way, move on.
      } finally {
        // Zero the ECDH shared secret on every path: success, failure, and exception.
        sharedSecret?.fill(0)
      }
    }
    return null
  } finally {
    privateKey.fill(0)
  }
}

/**
 * Decrypts the envelope and hashes the result against the plaintext hash recorded on chain — the one
 * check that ties these bytes to the document that was actually anchored. A caller must treat a
 * false `plaintextHashMatches` as "these are not the anchored bytes", not as a warning.
 */
export const decryptEnvelope = async (
  privateKeyHex: string,
  envelope: Envelope,
  onChainPlaintextHashHex: string
): Promise<DecryptOutcome | null> => {
  // An unknown version or type fails loudly. Guessing at a format this code has never seen could
  // silently produce plausible-looking bytes from an envelope that means something else entirely.
  if (envelope.version !== 1) {
    throw new Error(`Unsupported envelope version: ${envelope.version}`)
  }
  if (envelope.type !== ENVELOPE_TYPE) {
    throw new Error('Not a REEVE_ENCRYPTED_DOCUMENT envelope')
  }
  const match = await trialDecryptRecipients(privateKeyHex, envelope.slots)
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
      recipientIndex: match.recipientIndex,
      plaintextHashHex,
      plaintextHashMatches: plaintextHashHex === onChainPlaintextHashHex
    }
  } catch {
    return null
  } finally {
    match.dek.fill(0)
  }
}

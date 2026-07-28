import { bytesToHex, hexToBytes } from './codecs'

/**
 * A recipient's on-chain identifier:
 *
 *   recipient_key_hash = sha256( 32 raw bytes decoded from the lowercase-hex X25519 public key )
 *
 * rendered as 64 lowercase hex characters. This is a PUBLISHED wire format (cf-reeve-platform
 * docs/onChainFormat.md, "Recipient key hashes") reimplemented here from RecipientKeyHasher.java; the
 * golden vectors in the accompanying spec file are what keep the two in agreement. SHA-256 rather than
 * the SHA3-256 used for org ids, because WebCrypto implements no SHA-3 member.
 *
 * Takes the PUBLIC key only. Filtering never needs, derives, or transmits a private scalar.
 */
export const PUBLIC_KEY_HEX_REGEX = /^[0-9a-fA-F]{64}$/

export const hashPublicKey = async (publicKeyHex: string): Promise<string> => {
  if (!PUBLIC_KEY_HEX_REGEX.test(publicKeyHex)) {
    throw new Error('An X25519 public key must be 64 hexadecimal characters.')
  }

  // Decode FIRST: hashing the hex string instead of the bytes it denotes yields a plausible-looking
  // digest that the platform would never produce, so the filter would silently match nothing.
  const digest = await crypto.subtle.digest('SHA-256', hexToBytes(publicKeyHex.toLowerCase()))

  return bytesToHex(new Uint8Array(digest))
}

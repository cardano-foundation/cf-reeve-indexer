import { hexToBytes } from './codecs'

// Contract §2.1 - these values are shared with the Reeve frontend. Changing any of them
// makes documents encrypted there unopenable here. The KAT in decrypt.spec.ts pins them.
export const SLOT_KEK_INFO = 'reeve/document-vault/slot-kek/v1'

// §2.1 - the single app-wide PRF eval salt sent to the authenticator as `prf.eval.first`.
// SHA-256("reeve/document-vault/prf-salt/v1"). Shared with Reeve; the KAT in passkey.spec.ts pins it.
export const PRF_SALT = hexToBytes('37a30c186dd48cee6d01227a35960275d4c1f243ef8bbc68c53108dc0a7d7eaf')

// HKDF info string binding the passkey PRF output to the holder's X25519 keypair SEED. Its own
// domain string keeps the derived keypair independent of any other material derived from the same
// PRF output. The recipient key card's publicKey and every document decryption re-derive from this;
// changing it makes previously issued passkey cards underivable. Shared with Reeve; pinned by the
// KAT in passkey.spec.ts.
export const X25519_SEED_INFO = 'reeve/document-vault/x25519-seed/v1'

// Zero nonce is safe ONLY because each slotKEK derives from a single-use ephemeral key (§2.1).
export const SLOT_WRAP_NONCE = new Uint8Array(12)

export const ENVELOPE_TYPE = 'REEVE_ENCRYPTED_DOCUMENT'

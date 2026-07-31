import { hexToBytes } from './codecs'

// Every value in this file is shared with the Reeve frontend, which produces the documents this app
// consumes. Changing any of them makes already-published documents permanently unopenable here, so
// they are pinned by known-answer tests (decrypt.spec.ts, passkey.spec.ts) rather than left to drift.
//
// The literal strings below still read "slot" because they are baked into the derivation of every
// key that has ever wrapped a published document. They are ciphertext inputs, not names — renaming
// them would change the derived keys. The code around them calls the concept a recipient.

// HKDF info string for the per-recipient key-encryption key.
export const RECIPIENT_KEK_INFO = 'reeve/document-vault/slot-kek/v1'

// The single app-wide PRF eval salt sent to the authenticator as `prf.eval.first`.
// SHA-256("reeve/document-vault/prf-salt/v1").
export const PRF_SALT = hexToBytes('37a30c186dd48cee6d01227a35960275d4c1f243ef8bbc68c53108dc0a7d7eaf')

// HKDF info string binding the passkey PRF output to the holder's X25519 keypair SEED. Its own
// domain string keeps the derived keypair independent of any other material derived from the same
// PRF output. The recipient key card's publicKey and every document decryption re-derive from this;
// changing it makes previously issued passkey cards underivable.
export const X25519_SEED_INFO = 'reeve/document-vault/x25519-seed/v1'

// A zero nonce is safe here ONLY because each recipient KEK derives from a single-use ephemeral
// key, so no KEK ever encrypts twice.
export const RECIPIENT_WRAP_NONCE = new Uint8Array(12)

export const ENVELOPE_TYPE = 'REEVE_ENCRYPTED_DOCUMENT'

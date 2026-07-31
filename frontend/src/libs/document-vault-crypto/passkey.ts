import { x25519 } from '@noble/curves/ed25519'

import { base64urlToBytes, bytesToBase64url, bytesToHex } from './codecs'
import { PRF_SALT, X25519_SEED_INFO } from './constants'

/**
 * Passkey-gated key derivation, used by the indexer's independent, permissionless decrypt flow.
 *
 * The holder's X25519 keypair is DERIVED from a WebAuthn passkey PRF output — it is never stored,
 * wrapped, or uploaded. Issuance derives it once to obtain the publicKey for the card; decryption
 * re-derives the SAME private key from the same passkey. Nothing here contacts a backend, and the
 * private key exists only for the lifetime of a derive call and is zeroed on every path.
 */

export type PrfResult = { credentialId: string; prfOutput: Uint8Array }

// Injectable seam for `navigator.credentials.get` so the flow is unit-testable without a real
// authenticator (jsdom has none). Production passes the real navigator.credentials.get.
export type CredentialsGetter = (options: CredentialRequestOptions) => Promise<Credential | null>

export const isPasskeySupported = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.PublicKeyCredential !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  Boolean(navigator.credentials?.get)

// The subset of the WebAuthn PRF extension result we consume — not yet in the DOM lib typings.
type PrfExtensionResults = { prf?: { results?: { first?: ArrayBuffer } } }

/**
 * Run a WebAuthn assertion with the PRF extension and return the PRF output. When a
 * `credentialId` is known, scope the assertion to it; otherwise leave allowCredentials empty so the
 * OS picker lists the user's passkeys for this site.
 *
 * This is the WebAuthn step and must run first inside the user gesture — callers invoke it
 * directly from the click handler before any other async work.
 */
export const evaluatePrf = async (
  credentialId?: string,
  getCredential: CredentialsGetter = (options) => navigator.credentials.get(options)
): Promise<PrfResult> => {
  if (!isPasskeySupported()) {
    throw new Error('Passkeys are not supported in this browser.')
  }
  const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
    ? [{ id: base64urlToBytes(credentialId), type: 'public-key' }]
    : []

  const assertion = (await getCredential({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials,
      userVerification: 'required',
      // PRF_SALT is a fresh Uint8Array copy per call: WebAuthn may neuter the buffer it is given.
      extensions: { prf: { eval: { first: new Uint8Array(PRF_SALT) } } } as AuthenticationExtensionsClientInputs
    }
  })) as PublicKeyCredential | null

  if (!assertion) {
    throw new Error('Passkey assertion was cancelled.')
  }
  const prfFirst = (assertion.getClientExtensionResults() as PrfExtensionResults).prf?.results?.first
  if (!prfFirst) {
    throw new Error('This passkey did not return a PRF result — its store may not support PRF (see platform support).')
  }
  return { credentialId: bytesToBase64url(new Uint8Array(assertion.rawId)), prfOutput: new Uint8Array(prfFirst) }
}

/**
 * seed = HKDF-SHA-256(ikm = prfOutput, salt = empty, info = UTF-8(X25519_SEED_INFO), L = 32). The
 * seed IS the X25519 private scalar (RFC 7748, clamped at use by @noble). Returned as a Uint8Array
 * the caller MUST zero after use; domain-separated by the info string.
 */
const deriveSeedFromPrf = async (prfOutput: Uint8Array): Promise<Uint8Array> => {
  const ikmCopy = new Uint8Array(prfOutput)
  try {
    const ikm = await crypto.subtle.importKey('raw', ikmCopy, 'HKDF', false, ['deriveBits'])
    const seedBits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(X25519_SEED_INFO) },
      ikm,
      256
    )
    return new Uint8Array(seedBits)
  } finally {
    ikmCopy.fill(0) // Zero the PRF-derived IKM copy once the seed has been derived
  }
}

/**
 * ISSUANCE derivation: return ONLY the public key. The private scalar is computed as an ephemeral
 * Uint8Array and zeroed here — it is NEVER materialised as an (un-zeroable, GC-lingering) hex string,
 * because issuance needs nothing but the public half.
 */
export const deriveX25519PublicKeyFromPrf = async (prfOutput: Uint8Array): Promise<string> => {
  const seed = await deriveSeedFromPrf(prfOutput)
  try {
    return bytesToHex(x25519.getPublicKey(seed))
  } finally {
    seed.fill(0) // Zero the raw seed once the public key has been derived
  }
}

/**
 * DECRYPTION derivation: return the private key (and public key) hex. Only the decrypt path needs the
 * private scalar — to run ECDH — so only it materialises privateKeyHex; the caller drops it after use.
 */
export const deriveX25519FromPrf = async (
  prfOutput: Uint8Array
): Promise<{ privateKeyHex: string; publicKeyHex: string }> => {
  const seed = await deriveSeedFromPrf(prfOutput)
  try {
    return { privateKeyHex: bytesToHex(seed), publicKeyHex: bytesToHex(x25519.getPublicKey(seed)) }
  } finally {
    seed.fill(0) // Zero the raw seed once both hex copies have been taken
  }
}

// Injectable seam for `navigator.credentials.create`, mirroring CredentialsGetter, so registration
// is unit-testable without a real authenticator.
export type CredentialsCreator = (options: CredentialCreationOptions) => Promise<Credential | null>

export const isPasskeyRegistrationSupported = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.PublicKeyCredential !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  Boolean(navigator.credentials?.create)

/**
 * Register a new passkey with the PRF extension enabled. Requests PRF evaluation at creation so a
 * platform that supports it (Chrome) returns the PRF output in one gesture; when it does not
 * (results absent), the caller falls back to a follow-up assertion. No key material is produced
 * here — only the credential id (and, opportunistically, the PRF output) is returned.
 */
export const createPasskeyCredential = async (
  user: { name: string; displayName: string },
  createCredential: CredentialsCreator = (options) => navigator.credentials.create(options)
): Promise<{ credentialId: string; prfOutput?: Uint8Array }> => {
  if (!isPasskeyRegistrationSupported()) {
    throw new Error('Passkey creation is not supported in this browser.')
  }
  const credential = (await createCredential({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'Reeve Document Vault' },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: user.name || 'reeve-document-vault',
        displayName: user.displayName || user.name || 'Reeve recipient'
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
      // PRF_SALT is copied per call: WebAuthn may neuter the buffer it is given.
      extensions: { prf: { eval: { first: new Uint8Array(PRF_SALT) } } } as AuthenticationExtensionsClientInputs
    }
  })) as PublicKeyCredential | null

  if (!credential) {
    throw new Error('Passkey creation was cancelled.')
  }
  const first = (credential.getClientExtensionResults() as PrfExtensionResults).prf?.results?.first
  return {
    credentialId: bytesToBase64url(new Uint8Array(credential.rawId)),
    prfOutput: first ? new Uint8Array(first) : undefined
  }
}

/**
 * Issuance path: create a passkey (WebAuthn first in the gesture) and derive ONLY the holder's
 * X25519 PUBLIC key from its PRF output, plus the credential id (stored on the card so the holder can
 * re-scope the assertion later). The private scalar is never returned or materialised as a string —
 * issuance needs only the public half; the holder re-derives the private key from the passkey
 * at decrypt time.
 */
export const createPasskeyAndDeriveKeypair = async (
  user: { name: string; displayName: string },
  createCredential?: CredentialsCreator,
  getCredential?: CredentialsGetter
): Promise<{ publicKeyHex: string; credentialId: string }> => {
  const { credentialId, prfOutput } = await createPasskeyCredential(user, createCredential)
  const prf = prfOutput ?? (await evaluatePrf(credentialId, getCredential)).prfOutput
  try {
    const publicKeyHex = await deriveX25519PublicKeyFromPrf(prf)
    return { publicKeyHex, credentialId }
  } finally {
    prf.fill(0) // Zero the PRF output once the public key has been derived
  }
}

/**
 * Issuance path for an EXISTING passkey: the holder selects a passkey they already registered (OS
 * picker — no new credential is created), its PRF output is evaluated, and ONLY the X25519 PUBLIC key
 * is derived from it. Like createPasskeyAndDeriveKeypair, the private scalar is never returned or
 * materialised as a string; the returned credential id is the one the OS picker resolved to, so
 * the card records exactly which passkey re-derives the key at decrypt time.
 */
export const deriveCardKeyFromExistingPasskey = async (
  getCredential?: CredentialsGetter
): Promise<{ publicKeyHex: string; credentialId: string }> => {
  const { credentialId, prfOutput } = await evaluatePrf(undefined, getCredential)
  try {
    const publicKeyHex = await deriveX25519PublicKeyFromPrf(prfOutput)
    return { publicKeyHex, credentialId }
  } finally {
    prfOutput.fill(0) // Zero the PRF output once the public key has been derived
  }
}

/**
 * Decryption path: re-derive the holder's X25519 private key from their passkey. The user selects a
 * passkey (OS picker if credentialId is absent), the PRF output is evaluated, and the SAME private
 * key that issuance produced is reconstructed in-browser — no uploaded record, nothing stored.
 */
export const deriveKeypairWithPasskey = async (
  credentialId?: string,
  getCredential?: CredentialsGetter
): Promise<{ privateKeyHex: string; publicKeyHex: string; credentialId: string }> => {
  const { credentialId: id, prfOutput } = await evaluatePrf(credentialId, getCredential)
  try {
    const keypair = await deriveX25519FromPrf(prfOutput)
    return { ...keypair, credentialId: id }
  } finally {
    prfOutput.fill(0) // Zero the PRF output once the keypair has been derived
  }
}

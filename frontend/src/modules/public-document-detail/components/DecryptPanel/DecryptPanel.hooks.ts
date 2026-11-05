import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { DocumentVerdict, DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import type { DecryptOutcome, Envelope } from 'libs/document-vault-crypto/decrypt'
import { decryptEnvelope } from 'libs/document-vault-crypto/decrypt'
import { deriveKeypairWithPasskey } from 'libs/document-vault-crypto/passkey'
import {
  DECRYPT_NO_ANCHOR_HASH_MESSAGE,
  DECRYPT_NO_KEY_OPENS_MESSAGE,
  DECRYPT_RAW_KEY_INVALID
} from 'modules/public-document-detail/constants/detail.consts.ts'

const HEX_64_REGEX = /^[0-9a-fA-F]{64}$/

export type DecryptPanelStatus = 'idle' | 'keyReady' | 'decrypting' | 'success' | 'failure'

export type FetchEnvelopeFn = (args: { documentId: string; txHash?: string }) => Promise<Envelope>

export type DecryptFn = (privateKeyHex: string, envelope: Envelope, onChainPlaintextHashHex: string) => Promise<DecryptOutcome | null>

// Re-derives the holder's X25519 private key from their passkey (no stored record). Returns the
// private key hex; the hook stages it in a ref and drops it after the decrypt attempt.
export type DeriveKeypairFn = () => Promise<string>

export type UseDecryptPanelDeps = {
  fetchEnvelope?: FetchEnvelopeFn
  decrypt?: DecryptFn
  deriveKeypair?: DeriveKeypairFn
}

export type UseDecryptPanelArgs = {
  anchor: DocumentView
  deps?: UseDecryptPanelDeps
}

// Real default for fetchEnvelope: a direct, non-hook call to the same public envelope proxy the
// GetDocumentEnvelope model wraps in react-query. Kept hook-free so useDecryptPanel never needs a
// QueryClientProvider; the view injects the model's mutateAsync via `deps.fetchEnvelope`.
const defaultFetchEnvelope: FetchEnvelopeFn = async ({ documentId, txHash }) => {
  const { documentsApi } = backendReeveApi()
  return (await documentsApi.getDocumentEnvelope(documentId, txHash)) as Envelope
}

const defaultDeriveKeypair: DeriveKeypairFn = async () => (await deriveKeypairWithPasskey()).privateKeyHex

export type DecryptAvailability = 'available' | 'pending' | 'unavailable'

/**
 * Whether this anchor can be decrypted now. The envelope proxy serves only VERIFIED anchors, so for
 * anything else a decrypt would fail — after the holder had already gone through a passkey prompt.
 *
 * IPFS_UNAVAILABLE counts as pending, not final: the indexer keeps retrying the IPFS fetch after
 * setting it, and a later success turns the anchor VERIFIED. The other failures are final.
 */
export const decryptAvailabilityOf = (verdict: DocumentVerdict): DecryptAvailability => {
  switch (verdict) {
    case 'VERIFIED':
      return 'available'
    case 'PENDING':
    case 'IPFS_UNAVAILABLE':
      return 'pending'
    case 'MALFORMED_MANIFEST':
    case 'CONTENT_HASH_MISMATCH':
    case 'MALFORMED_ENVELOPE':
      return 'unavailable'
    default:
      // A verdict this client does not know yet: fail closed, as final rather than "pending".
      return 'unavailable'
  }
}

/**
 * In-browser decrypt flow as a state machine: idle -> keyReady -> decrypting -> success | failure.
 *
 * The private key comes from one of two client-side sources: the holder's passkey (re-derived
 * in-browser — the permissionless model's primary path) or a raw hex key (a fallback). Whatever the
 * source, the key never lives in React state: it sits in a ref, populated only by
 * `setRawKey`/`unlockWithPasskey`, and is cleared (`clearKeyMaterial`) after every decrypt attempt
 * and on unmount. `decrypt()` is the only network-triggering action and runs only when called —
 * never on mount, and never by itself when a key is loaded. The panel calls it straight after
 * `setRawKey`/`unlockWithPasskey`, in the same click, so `keyReady` is never shown to the user.
 *
 * Nothing is accepted for an anchor that is not decryptable yet (see `decryptAvailabilityOf`), and
 * the whole flow starts over whenever the anchor or its availability changes.
 */
export const useDecryptPanel = ({ anchor, deps }: UseDecryptPanelArgs) => {
  const fetchEnvelope = deps?.fetchEnvelope ?? defaultFetchEnvelope
  const decryptFn = deps?.decrypt ?? decryptEnvelope
  const deriveKeypairFn = deps?.deriveKeypair ?? defaultDeriveKeypair

  const availability = decryptAvailabilityOf(anchor.verdict)
  const isAvailable = availability === 'available'

  const [status, setStatus] = useState<DecryptPanelStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<DecryptOutcome | null>(null)

  // The status decrypt() checks. A click handler calls decrypt() right after handing over a key,
  // before React re-renders, so the `status` of the render the handler came from still says "no key
  // yet". The ref is current immediately, and also stops a second decrypt while one is running.
  const statusRef = useRef<DecryptPanelStatus>('idle')

  const moveTo = useCallback((next: DecryptPanelStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  // The private key (hex). Never in state.
  const privateKeysRef = useRef<string[]>([])
  // The anchor (tx hash) the staged key was handed over for. decrypt() only runs for that anchor,
  // even when called through a function created while another anchor was on screen.
  const keyAnchorRef = useRef<string | null>(null)

  // Bumped by every reset. An unlock or decrypt that was already awaiting when a reset happened
  // sees a different value when it resumes, and drops its result.
  const attemptRef = useRef(0)

  const clearKeyMaterial = useCallback(() => {
    privateKeysRef.current = []
    keyAnchorRef.current = null
  }, [])

  useEffect(() => clearKeyMaterial, [clearKeyMaterial])

  const reset = useCallback(() => {
    attemptRef.current += 1
    clearKeyMaterial()
    moveTo('idle')
    setErrorMessage(null)
    setOutcome(null)
  }, [clearKeyMaterial, moveTo])

  // The panel is not remounted when the user picks another anchor of the same document, so a key,
  // a decrypted document or an error from the previous anchor would otherwise carry over to it. A
  // layout effect, so the stale state is never painted.
  useLayoutEffect(() => {
    reset()
  }, [anchor.tx_hash, availability, reset])

  const setRawKey = (hex: string) => {
    if (!isAvailable) return
    const trimmed = hex.trim()
    if (!HEX_64_REGEX.test(trimmed)) {
      clearKeyMaterial()
      moveTo('idle')
      setErrorMessage(DECRYPT_RAW_KEY_INVALID)
      return
    }
    privateKeysRef.current = [trimmed.toLowerCase()]
    keyAnchorRef.current = anchor.tx_hash
    setErrorMessage(null)
    moveTo('keyReady')
  }

  const unlockWithPasskey = async () => {
    // Not even the passkey prompt for an anchor whose envelope cannot be fetched yet.
    if (!isAvailable) return
    // Re-deriving from a passkey discards any staged raw key AND its keyReady status first: if the
    // derive then fails, no stale key or ready-state survives for a later decrypt().
    clearKeyMaterial()
    moveTo('idle')
    setErrorMessage(null)
    const attempt = attemptRef.current
    try {
      // deriveKeypairFn runs the WebAuthn assertion first, inside the caller's click gesture.
      const privateKeyHex = await deriveKeypairFn()
      // Reset while the prompt was open (another anchor, or another key source): the key is not
      // for what is on screen now.
      if (attemptRef.current !== attempt) return
      privateKeysRef.current = [privateKeyHex.toLowerCase()]
      // No reset since the prompt opened (checked above), so this is still the anchor on screen.
      keyAnchorRef.current = anchor.tx_hash
      moveTo('keyReady')
    } catch (err) {
      if (attemptRef.current !== attempt) return
      setErrorMessage(err instanceof Error ? err.message : 'Could not derive a key from your passkey.')
    }
  }

  const runDecrypt = async () => {
    // Reads the ref, not this render's `status`: see statusRef. The availability check is defence in
    // depth, since a reset already makes keyReady unreachable here.
    if (!isAvailable || statusRef.current !== 'keyReady' || privateKeysRef.current.length === 0) return
    // A key handed over for another anchor is not this anchor's to use; it stays staged for its own.
    if (keyAnchorRef.current !== anchor.tx_hash) return

    const keys = privateKeysRef.current

    if (!anchor.document_id || !anchor.plaintext_hash) {
      clearKeyMaterial()
      moveTo('failure')
      setErrorMessage(DECRYPT_NO_ANCHOR_HASH_MESSAGE)
      return
    }

    const attempt = attemptRef.current
    // True once a reset happened after this attempt started, e.g. the user picked another anchor
    // while the envelope was still loading.
    const isStale = () => attemptRef.current !== attempt

    // Before the first await, so a second call that arrives meanwhile finds no key ready.
    moveTo('decrypting')
    setErrorMessage(null)

    try {
      const envelope = await fetchEnvelope({ documentId: anchor.document_id, txHash: anchor.tx_hash })
      // Trial-decrypt with each staged key against the single fetched envelope; first success wins.
      let result: DecryptOutcome | null = null
      for (const key of keys) {
        result = await decryptFn(key, envelope, anchor.plaintext_hash)
        if (result) break
      }
      // This anchor's plaintext and verdict must never land under another one.
      if (isStale()) return
      if (!result) {
        moveTo('failure')
        setErrorMessage(DECRYPT_NO_KEY_OPENS_MESSAGE)
        return
      }
      setOutcome(result)
      moveTo('success')
    } catch (err) {
      if (isStale()) return
      // decryptEnvelope throws on an unknown envelope version/type - surface that message
      // verbatim, never swallow it into a generic "decryption failed" string.
      moveTo('failure')
      setErrorMessage(err instanceof Error ? err.message : 'Decryption failed.')
    } finally {
      // After a reset the key ref was already cleared, and may since hold a key the user staged for
      // the new anchor: leave it alone.
      if (!isStale()) clearKeyMaterial()
    }
  }

  return {
    availability,
    status,
    errorMessage,
    outcome,
    setRawKey,
    unlockWithPasskey,
    decrypt: runDecrypt,
    reset
  }
}

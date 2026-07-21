import { useEffect, useRef, useState } from 'react'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
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

/**
 * §2.6 in-browser decrypt flow as a state machine: idle -> keyReady -> decrypting -> success | failure.
 *
 * The private key comes from one of two client-side sources: the holder's passkey (re-derived
 * in-browser — the permissionless model's primary path) or a raw hex key (a fallback). Whatever the
 * source, the key never lives in React state (I1): it sits in a ref, populated only by
 * `setRawKey`/`unlockWithPasskey`, and is cleared (`clearKeyMaterial`) after every decrypt attempt
 * and on unmount. `decrypt()` is the only network-triggering action and only ever runs on an
 * explicit caller invocation (I3) — never on mount or as a side-effect of loading a key.
 */
export const useDecryptPanel = ({ anchor, deps }: UseDecryptPanelArgs) => {
  const fetchEnvelope = deps?.fetchEnvelope ?? defaultFetchEnvelope
  const decryptFn = deps?.decrypt ?? decryptEnvelope
  const deriveKeypairFn = deps?.deriveKeypair ?? defaultDeriveKeypair

  const [status, setStatus] = useState<DecryptPanelStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<DecryptOutcome | null>(null)

  // The private key (hex). Never in state (I1).
  const privateKeysRef = useRef<string[]>([])

  const clearKeyMaterial = () => {
    privateKeysRef.current = []
  }

  useEffect(() => clearKeyMaterial, [])

  const reset = () => {
    clearKeyMaterial()
    setStatus('idle')
    setErrorMessage(null)
    setOutcome(null)
  }

  const setRawKey = (hex: string) => {
    const trimmed = hex.trim()
    if (!HEX_64_REGEX.test(trimmed)) {
      clearKeyMaterial()
      setStatus('idle')
      setErrorMessage(DECRYPT_RAW_KEY_INVALID)
      return
    }
    privateKeysRef.current = [trimmed.toLowerCase()]
    setErrorMessage(null)
    setStatus('keyReady')
  }

  const unlockWithPasskey = async () => {
    // Re-deriving from a passkey discards any staged raw key AND its keyReady status first (I1
    // hygiene): if the derive then fails, no stale key or ready-state survives for a later decrypt().
    clearKeyMaterial()
    setStatus('idle')
    setErrorMessage(null)
    try {
      // I3: deriveKeypairFn runs the WebAuthn assertion first, inside the caller's click gesture.
      const privateKeyHex = await deriveKeypairFn()
      privateKeysRef.current = [privateKeyHex.toLowerCase()]
      setStatus('keyReady')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not derive a key from your passkey.')
    }
  }

  const runDecrypt = async () => {
    if (status !== 'keyReady' || privateKeysRef.current.length === 0) return

    const keys = privateKeysRef.current

    if (!anchor.document_id || !anchor.plaintext_hash) {
      clearKeyMaterial()
      setStatus('failure')
      setErrorMessage(DECRYPT_NO_ANCHOR_HASH_MESSAGE)
      return
    }

    setStatus('decrypting')
    setErrorMessage(null)

    try {
      const envelope = await fetchEnvelope({ documentId: anchor.document_id, txHash: anchor.tx_hash })
      // Trial-decrypt with each staged key against the single fetched envelope; first success wins (I6).
      let result: DecryptOutcome | null = null
      for (const key of keys) {
        result = await decryptFn(key, envelope, anchor.plaintext_hash)
        if (result) break
      }
      if (!result) {
        setStatus('failure')
        setErrorMessage(DECRYPT_NO_KEY_OPENS_MESSAGE)
        return
      }
      setOutcome(result)
      setStatus('success')
    } catch (err) {
      // I7: decryptEnvelope throws on an unknown envelope version/type - surface that message
      // verbatim, never swallow it into a generic "decryption failed" string.
      setStatus('failure')
      setErrorMessage(err instanceof Error ? err.message : 'Decryption failed.')
    } finally {
      clearKeyMaterial()
    }
  }

  return {
    status,
    errorMessage,
    outcome,
    setRawKey,
    unlockWithPasskey,
    decrypt: runDecrypt,
    reset
  }
}

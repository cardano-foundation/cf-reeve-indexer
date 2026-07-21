import { useRef, useState } from 'react'

import type { KeyCard } from 'libs/document-vault-crypto/cards'
import { buildCard, formatInstantSeconds } from 'libs/document-vault-crypto/cards'
import type { IssueSubject } from 'libs/document-vault-crypto/issue'
import { createPasskeyAndDeriveKeypair, deriveCardKeyFromExistingPasskey } from 'libs/document-vault-crypto/passkey'
import { ISSUE_ERROR_FALLBACK_MESSAGE } from 'modules/card-issuance/constants/issuance.consts'

export type IssueCardFormStatus = 'idle' | 'issuing' | 'issued' | 'error'

// How the holder's passkey is obtained: 'create' registers a NEW passkey on this device; 'existing'
// asks the OS to pick a passkey the holder already registered. Either way only the PUBLIC key is
// derived from its PRF output — the private scalar is never materialised here (I1/I5).
export type PasskeyMode = 'create' | 'existing'

// The card build needs ONLY the public key + credential id. The private key is derived inside the
// passkey helper, used to compute the public key, and never surfaced here (I1/I5) — it is
// re-derivable from the holder's passkey at decrypt time, so nothing needs to retain it.
export type DeriveKeypairFn = (args: {
  mode: PasskeyMode
  user: { name: string; displayName: string }
}) => Promise<{ publicKeyHex: string; credentialId: string }>

export type UseIssueCardFormDeps = {
  deriveKeypair?: DeriveKeypairFn
}

export type UseIssueCardFormArgs = {
  deps?: UseIssueCardFormDeps
}

// Real default: for 'create', register a passkey in this browser and derive the holder's X25519
// public key from it; for 'existing', let the holder pick a passkey they already have and derive the
// public key from that. Only the public half and the credential id are returned — the private key is
// never materialised (I1/I5).
const defaultDeriveKeypair: DeriveKeypairFn = async ({ mode, user }) =>
  mode === 'existing' ? deriveCardKeyFromExistingPasskey() : createPasskeyAndDeriveKeypair(user)

// Cards created here are always for an EXTERNAL holder — someone with no Reeve login, who decrypts
// published documents in the Indexer. There is therefore no account id to mis-type: the client mints
// the subjectId (as the backend used to), which is why the operator is never asked for one.
const EXTERNAL_SUBJECT_TYPE = 'EXTERNAL' as const

/**
 * The card creation state machine (§9.4): idle -> issuing -> issued | error.
 *
 * PERMISSIONLESS and fully client-side: the keypair is DERIVED from a passkey created IN THE BROWSER,
 * only the public half is handed to `buildCard`, and the UNSIGNED card is assembled and returned
 * locally — there is no login and no network call. The private key is never retained (re-derivable
 * from the holder's passkey at decrypt time), so this hook holds no key material at all.
 */
export const useIssueCardForm = ({ deps }: UseIssueCardFormArgs = {}) => {
  const deriveKeypairFn = deps?.deriveKeypair ?? defaultDeriveKeypair

  const [status, setStatus] = useState<IssueCardFormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [issuedCard, setIssuedCard] = useState<KeyCard | null>(null)

  // Non-private retry state: the derived PUBLIC key + credential id from the first attempt, kept so a
  // retry after a transient failure reuses the SAME passkey/publicKey rather than registering a
  // second passkey (a different identity). No private material is ever held here.
  const derivedRef = useRef<{ publicKeyHex: string; credentialId: string } | null>(null)

  // Returns the built card on success (or null on failure) so callers don't need to read the hook's
  // re-rendered state from inside an async handler's stale closure. `mode` selects whether a NEW
  // passkey is registered or an EXISTING one is used to derive the holder's public key.
  const issue = async (subject: IssueSubject, label: string, mode: PasskeyMode = 'create'): Promise<KeyCard | null> => {
    setStatus('issuing')
    setErrorMessage(null)
    setIssuedCard(null)

    try {
      // I3: on the FIRST attempt the passkey step (WebAuthn create/get) runs straight from the click
      // gesture. On a retry, reuse the already-derived public key (no second WebAuthn prompt).
      if (!derivedRef.current) {
        derivedRef.current = await deriveKeypairFn({
          mode,
          user: {
            name: subject.email ?? 'reeve-recipient',
            displayName: subject.displayName ?? subject.email ?? 'Reeve recipient'
          }
        })
      }

      const card = buildCard({
        subject: { ...subject, subjectType: EXTERNAL_SUBJECT_TYPE, subjectId: crypto.randomUUID() },
        publicKeyHex: derivedRef.current.publicKeyHex,
        label,
        assurance: 'PASSKEY',
        createdAt: formatInstantSeconds(new Date())
      })

      setIssuedCard(card)
      setStatus('issued')
      return card
    } catch (err) {
      // Keep derivedRef so a retry reuses the same passkey/publicKey; reset() is the only clear.
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : ISSUE_ERROR_FALLBACK_MESSAGE)
      return null
    }
  }

  const reset = () => {
    derivedRef.current = null
    setStatus('idle')
    setErrorMessage(null)
    setIssuedCard(null)
  }

  return {
    status,
    errorMessage,
    issuedCard,
    issue,
    reset
  }
}

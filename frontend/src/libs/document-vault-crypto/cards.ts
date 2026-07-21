/**
 * The REEVE_KEY_CARD is UNSIGNED (permissionless import model, §9.4): it carries the holder's
 * PUBLIC key only — no issuer object, no signature, and never any private key material. Identity
 * binding is out-of-band; the importing org verifies the public key through a separate channel.
 */
export type KeyCard = {
  v: number
  type: string
  subject: { subjectType: string; subjectId: string; displayName?: string; email?: string; organisationId: string }
  key: { publicKey: string; label?: string; assurance: string; createdAt: string }
}

export const parseCard = (raw: string): KeyCard => {
  const card = JSON.parse(raw) as KeyCard
  // I7: readers that meet an unknown version MUST fail visibly rather than guess.
  if (card.v !== 1) throw new Error(`Unsupported card version: ${card.v}`)
  if (card.type !== 'REEVE_KEY_CARD') throw new Error('Not a REEVE_KEY_CARD')
  if (!card.subject || !card.key) throw new Error('Malformed card')
  return card
}

export type BuildCardInput = {
  subject: {
    subjectType: 'REEVE_ACCOUNT' | 'EXTERNAL'
    // Fully resolved by the caller: REEVE_ACCOUNT carries the entered id, EXTERNAL a client-minted UUID.
    subjectId: string
    displayName?: string
    email?: string
    organisationId?: string
  }
  publicKeyHex: string
  label?: string
  assurance?: 'PASSKEY' | 'PORTABLE'
  // ISO-8601 second-precision instant, supplied by the caller (see formatInstantSeconds) so buildCard
  // stays pure and deterministic.
  createdAt: string
}

/** Truthy only for a value that has non-whitespace content — mirrors the backend's "omit when blank". */
const isPresent = (value?: string): value is string => Boolean(value && value.trim() !== '')

/**
 * The inverse of parseCard: assemble an UNSIGNED REEVE_KEY_CARD entirely client-side (§9.4). Public
 * key only — no issuer, no signature, no private material by construction. Blank optional fields are
 * omitted and organisationId defaults to '' so the result matches the wire shape parseCard accepts.
 */
export const buildCard = ({ subject, publicKeyHex, label, assurance = 'PASSKEY', createdAt }: BuildCardInput): KeyCard => {
  const cardSubject: KeyCard['subject'] = {
    subjectType: subject.subjectType,
    subjectId: subject.subjectId,
    organisationId: isPresent(subject.organisationId) ? subject.organisationId : ''
  }
  if (isPresent(subject.displayName)) cardSubject.displayName = subject.displayName
  if (isPresent(subject.email)) cardSubject.email = subject.email

  const cardKey: KeyCard['key'] = { publicKey: publicKeyHex, assurance, createdAt }
  if (isPresent(label)) cardKey.label = label

  return { v: 1, type: 'REEVE_KEY_CARD', subject: cardSubject, key: cardKey }
}

/** Millisecond-stripped ISO-8601 (e.g. 2026-07-16T10:15:30Z) — the backend's card createdAt precision. */
export const formatInstantSeconds = (date: Date): string => date.toISOString().replace(/\.\d{3}Z$/, 'Z')

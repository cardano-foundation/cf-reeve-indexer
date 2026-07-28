import type { KeyCard } from 'libs/document-vault-crypto/cards'

/**
 * Cards are created client-side (permissionless, no login), so the only always-on card contract is
 * the public status flag. The attest-with-Veridian ceremony endpoints (below) are ALSO public — the
 * wizard has no operator credentials — and drive an already-built card through pairing, credential
 * presentation, and attestation. NOTHING is published to Cardano: the attestation is the wallet's own
 * KEL interaction event, which the indexer verifies and records on the card.
 */
export type CardStatusResponse = { issuance_enabled: boolean }

/** Ceremony state machine (backend {@code CardCeremonyState}): CREATED -> PAIRED ->
 *  CREDENTIAL_RECEIVED -> ATTEST_ANCHORED, with FAILED/EXPIRED terminal. */
export type CardCeremonyState = 'CREATED' | 'PAIRED' | 'CREDENTIAL_RECEIVED' | 'ATTEST_ANCHORED' | 'FAILED' | 'EXPIRED'

/**
 * The now-attested card carries an extra `attestation` block on top of the base KeyCard — this is
 * what the holder imports into the platform, which verifies the credential and the KEL anchor.
 *
 * The KEL anchor is the whole proof: `kelSequence`/`kelEventSaid` name the wallet interaction event
 * that signed this card, and `metadataLabel` is the exact STRING fed into the anchored payload SAID.
 * `cardDigest`/`payloadSaid` are INFORMATIONAL ONLY — a verifier recomputes both from the card body
 * and compares, since the indexer supplied both the claim and the value it would be checked against.
 */
export type AttestedKeyCard = KeyCard & {
  attestation?: {
    oobi?: string
    aid: string
    credentialSaid?: string
    schemaSaid?: string
    kelSequence?: string
    kelEventSaid?: string
    metadataLabel?: string
    cardDigest?: string
    payloadSaid?: string
    credentialCesr?: string
  }
}

/** snake_case on the wire (backend CardCeremonyView). A step failure is a 200 with state=FAILED plus
 *  error_title/error_detail — NOT an HTTP error; only a usage error (bad id, malformed card) rejects. */
export type CardCeremonyResponse = {
  ceremony_id: string
  card_id: string
  state: CardCeremonyState
  agent_oobi: string | null
  // Present ONLY at ATTEST_ANCHORED: the exported, fully-attested card to download and import.
  card: AttestedKeyCard | null
  error_title: string | null
  error_detail: string | null
}

/** Body of POST /attestation/ceremonies — the full client-built card to register + attest. */
export type CreateCardCeremonyRequest = { card: KeyCard }
/** Body of the /pair step. */
export type PairCardCeremonyRequest = { walletOobiUrl: string }
/** Body of the /present-credential and /attest steps: retry re-runs the (previously failed) step. */
export type CardCeremonyStepRequest = { retry?: boolean }

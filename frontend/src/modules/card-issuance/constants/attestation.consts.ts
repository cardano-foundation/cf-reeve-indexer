/**
 * Copy and constants for the attest-with-Veridian wizard (design doc Part A / A7). After a card is
 * issued, its holder can OPTIONALLY anchor a Veridian credential attestation on-chain so that, when
 * the card is later imported into the platform, the platform can cryptographically verify who the
 * holder is (B2). The wizard drives the indexer's synchronous ceremony endpoints, one blocking step
 * at a time — pair the wallet, present the credential, attest — then hands back the attested card to
 * download. Everything here is PUBLIC (no login): the ceremony endpoints are unauthenticated, exactly
 * like the rest of this client-side issuance flow.
 */

export const ATTEST_WIZARD_OPEN_LABEL = 'Attest with Veridian (optional)'
export const ATTEST_WIZARD_OPEN_NOTE =
  'Optionally bind a Veridian credential to this card and anchor it on-chain, so an importer can verify the holder’s identity. You’ll need the Veridian wallet that holds the credential.'

export const ATTEST_WIZARD_TITLE = 'Attest this card with Veridian'

export const ATTEST_PREPARING_LABEL = 'Preparing the ceremony…'

// --- pairing (CREATED) ---
export const ATTEST_PAIR_TITLE = '1. Pair your Veridian wallet'
export const ATTEST_AGENT_OOBI_LABEL = 'Indexer OOBI — resolve this in your Veridian wallet first'
export const ATTEST_AGENT_OOBI_PENDING = 'The indexer’s KERI agent is still starting up. Please retry in a moment.'
export const ATTEST_COPY_OOBI_LABEL = 'Copy OOBI'
export const ATTEST_COPY_OOBI_DONE_LABEL = 'Copied'
export const ATTEST_WALLET_OOBI_LABEL = 'Your wallet OOBI'
export const ATTEST_WALLET_OOBI_GUIDANCE =
  'In Veridian, resolve the indexer OOBI above, then copy your own wallet’s OOBI URL and paste it here.'
export const ATTEST_PAIR_BUTTON_LABEL = 'Pair wallet'
export const ATTEST_PAIRING_LABEL = 'Pairing…'

// --- credential presentation (PAIRED) ---
export const ATTEST_PRESENT_TITLE = '2. Present your credential'
export const ATTEST_PRESENT_GUIDANCE =
  'Your Veridian wallet will prompt you to share a credential. This screen waits until the wallet responds.'
export const ATTEST_PRESENT_BUTTON_LABEL = 'Present credential'
export const ATTEST_PRESENTING_LABEL = 'Waiting for the wallet to present the credential…'

// --- attestation (CREDENTIAL_RECEIVED) ---
export const ATTEST_ANCHOR_TITLE = '3. Attest on-chain'
export const ATTEST_ANCHOR_GUIDANCE =
  'Your wallet will prompt you to sign the attestation; the indexer then anchors it on Cardano. This can take a moment.'
export const ATTEST_ANCHOR_BUTTON_LABEL = 'Attest & anchor'
export const ATTEST_ANCHORING_LABEL = 'Anchoring the attestation on-chain…'

// --- success (ATTEST_ANCHORED) ---
export const ATTEST_DONE_TITLE = 'Card attested'
export const ATTEST_DONE_NOTE =
  'This card now carries a verified Veridian attestation. Download it and import THIS file into the platform — the earlier (unattested) download will not verify.'
export const ATTEST_DOWNLOAD_LABEL = 'Download attested card'
export const ATTEST_TX_LABEL = 'On-chain attestation tx'
export const ATTEST_CLOSE_LABEL = 'Done'

// --- failure / expiry / errors ---
export const ATTEST_FAILED_TITLE = 'Attestation could not be completed'
export const ATTEST_EXPIRED_MESSAGE = 'This ceremony expired before it finished. Start over to try again.'
export const ATTEST_START_OVER_LABEL = 'Start over'
export const ATTEST_CANCEL_LABEL = 'Cancel'
export const ATTEST_FALLBACK_ERROR = 'Something went wrong driving the attestation. Please try again.'

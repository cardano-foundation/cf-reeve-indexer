/**
 * Copy and constants for the attest-with-Veridian wizard. After a card is issued, its holder can
 * OPTIONALLY bind a Veridian credential to it so that, when the card is later imported into the
 * platform, the platform can cryptographically verify who the holder is. The wizard drives the
 * indexer's synchronous ceremony endpoints, one blocking step at a time — pair the wallet, present
 * the credential, attest — then hands back the attested card to download. Everything here is PUBLIC
 * (no login): the ceremony endpoints are unauthenticated, exactly like the rest of this client-side
 * issuance flow.
 *
 * NOTHING is published to Cardano. The attestation is the wallet's own signed KEL interaction event,
 * carried on the card as a self-contained proof — so the copy below must not promise an on-chain
 * record, a tx, or a wait for confirmation.
 */

export const ATTEST_WIZARD_OPEN_LABEL = 'Attest with Veridian (optional)'
export const ATTEST_WIZARD_OPEN_NOTE =
  'Optionally bind a Veridian credential to this card, so an importer can verify the holder’s identity. You’ll need the Veridian wallet that holds the credential. Nothing is published — the attestation is signed by your wallet and travels with the card.'

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
export const ATTEST_ANCHOR_TITLE = '3. Sign the attestation'
export const ATTEST_ANCHOR_GUIDANCE =
  'Your wallet will prompt you to sign the attestation, which it records in its own key event log. The indexer verifies that signature and writes it onto the card. This can take a moment.'
export const ATTEST_ANCHOR_BUTTON_LABEL = 'Attest card'
export const ATTEST_ANCHORING_LABEL = 'Waiting for the wallet to sign…'

// --- success (ATTEST_ANCHORED) ---
export const ATTEST_DONE_TITLE = 'Card attested'
export const ATTEST_DONE_NOTE =
  'This card now carries a verified Veridian attestation. Download it and import THIS file into the platform — the earlier (unattested) download will not verify.'
export const ATTEST_DOWNLOAD_LABEL = 'Download attested card'
export const ATTEST_ANCHOR_LABEL = 'Wallet key event log anchor'
export const ATTEST_CLOSE_LABEL = 'Done'

// --- failure / expiry / errors ---
export const ATTEST_FAILED_TITLE = 'Attestation could not be completed'
export const ATTEST_EXPIRED_MESSAGE = 'This ceremony expired before it finished. Start over to try again.'
export const ATTEST_START_OVER_LABEL = 'Start over'
export const ATTEST_CANCEL_LABEL = 'Cancel'
export const ATTEST_FALLBACK_ERROR = 'Something went wrong driving the attestation. Please try again.'

// --- progress stepper ---
// The ceremony's four steps, in state-machine order. The wizard maps the authoritative server state
// onto an index here rather than tracking its own, so a resumed or reloaded ceremony lands on the
// right step without any client-side bookkeeping to get out of sync.
export const ATTEST_STEPS = ['Pair wallet', 'Present credential', 'Sign attestation', 'Download'] as const

// --- waiting on the wallet ---
// Every step after pairing BLOCKS on a human picking up their phone and approving a prompt in
// Veridian, which can take tens of seconds. A 16px spinner inside a disabled button reads as "the page
// is stuck"; these say what is being waited on, and that waiting is expected.
export const ATTEST_WAITING_TITLE = 'Waiting for your Veridian wallet'
export const ATTEST_WAITING_PRESENT_DETAIL =
  'Open Veridian and approve the credential request. This screen updates by itself once the wallet responds — keep it open.'
export const ATTEST_WAITING_ANCHOR_DETAIL =
  'Open Veridian and approve the signing request. This screen updates by itself once the wallet responds — keep it open.'
export const ATTEST_WAITING_PAIR_DETAIL = 'Resolving your wallet OOBI with the indexer’s KERI agent.'

// --- presented credential (CREDENTIAL_RECEIVED onward) ---
// Deliberately "presented", never "verified". The indexer is permissionless and does not check the
// credential's schema, issuer, trust chain or revocation state — the platform's import verifier does.
// Copy that implied otherwise here would be a security claim this component cannot back.
export const ATTEST_PRESENTED_CREDENTIAL_TITLE = 'Credential presented'
export const ATTEST_PRESENTED_CREDENTIAL_NOTE =
  'Shown as presented by your wallet. The indexer does not verify it — the platform checks the issuer and trust chain when you import the card.'
export const ATTEST_PRESENTED_SCHEMA_LABEL = 'Credential type'
export const ATTEST_PRESENTED_UNKNOWN_SCHEMA = 'Unrecognised credential type'
export const ATTEST_PRESENTED_ISSUER_LABEL = 'Issued by (claimed)'
export const ATTEST_PRESENTED_CLAIMS_LABEL = 'Details'
export const ATTEST_PRESENTED_NO_CLAIMS = 'This credential carries no additional details.'

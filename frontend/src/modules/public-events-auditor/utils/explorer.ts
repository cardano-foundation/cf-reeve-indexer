/**
 * Base URL for linking a transaction hash to a Cardano block explorer. Kept as a single constant so
 * every on-chain link in the auditor view stays consistent with the rest of the app, which links to
 * mainnet explorer.cardano.org. Append a transaction hash to build a link.
 */
export const EXPLORER_TX_URL = 'https://explorer.cardano.org/transaction/'

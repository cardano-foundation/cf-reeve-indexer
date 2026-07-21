import { APP_EXPLORER_URL, APP_IPFS_GATEWAY_URL } from 'libs/api-connectors/backend-connector-reeve/const/envs.ts'

/** Joins a configured base URL with a path segment, tolerating a trailing slash on the base. */
const composeUrl = (base: string | undefined, segment: string): string | null => (base ? `${base.replace(/\/+$/, '')}/${segment}` : null)

/** L1 explorer link for an anchor's transaction hash (§9.5) - null when the deployment has no explorer configured. */
export const explorerTxUrl = (txHash: string): string | null => composeUrl(APP_EXPLORER_URL, txHash)

/** Raw IPFS gateway link for an envelope CID (§9.5) - null when the deployment has no gateway configured. */
export const ipfsCidUrl = (cid: string): string | null => composeUrl(APP_IPFS_GATEWAY_URL, cid)

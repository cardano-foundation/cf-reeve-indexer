/**
 * Cards are created client-side (permissionless, no login), so the only card contract the frontend
 * needs from the backend is the public status flag. Issue/registry/export request+response types and
 * operator credentials are intentionally absent — nothing here is authenticated.
 */
export type CardStatusResponse = { issuance_enabled: boolean }

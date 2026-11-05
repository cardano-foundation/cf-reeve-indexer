import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import type { PresentedCredential } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types'
import {
  ATTEST_PRESENTED_CLAIMS_LABEL,
  ATTEST_PRESENTED_CREDENTIAL_NOTE,
  ATTEST_PRESENTED_CREDENTIAL_TITLE,
  ATTEST_PRESENTED_ISSUER_LABEL,
  ATTEST_PRESENTED_NO_CLAIMS,
  ATTEST_PRESENTED_SCHEMA_LABEL,
  ATTEST_PRESENTED_UNKNOWN_SCHEMA
} from 'modules/card-issuance/constants/attestation.consts'

type Props = { credential: PresentedCredential }

/** Turns `legalName` / `legal_name` into `Legal name`, so a schema's own attribute names are readable
 *  without the frontend having to know any schema. */
const humanizeClaimKey = (key: string) => {
  const spaced = key.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2')

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

/** Objects and arrays are stringified rather than dropped: a nested claim is still information, and a
 *  blank row would read as "this credential says nothing about that". */
const formatClaimValue = (value: unknown) => (typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value))

/**
 * Shows what the paired Veridian wallet actually handed over, so the holder can see a Foundation
 * Employee's name and role (or a vLEI's LEI, or any other schema's attributes) rather than an opaque
 * SAID before signing the attestation.
 *
 * <p>Rendered generically from the `claims` map: adding a schema needs no change here, only a registry
 * entry on the indexer. An unrecognised schema still renders — it is a legitimate presentation, and
 * the raw SAID is shown in place of a name.
 *
 * <p><b>Presented, not verified.</b> The indexer is permissionless and deliberately does not check the
 * credential's schema, issuer, trust chain or revocation state; the platform's import verifier is the
 * gate that matters. Hence the neutral chip and the explicit note — a green "verified" tick here would
 * be a security claim nothing in this path backs. Do not "improve" the wording in that direction.
 */
export const PresentedCredentialPanel = ({ credential }: Props) => {
  const theme = useTheme()
  const claimEntries = Object.entries(credential.claims ?? {})

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1.5}
      sx={{ backgroundColor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
      <Box alignItems="center" display="flex" flexWrap="wrap" gap={1}>
        <Typography variant="subtitle2">{ATTEST_PRESENTED_CREDENTIAL_TITLE}</Typography>
        <Chip label={credential.schema_name ?? ATTEST_PRESENTED_UNKNOWN_SCHEMA} size="small" variant="outlined" />
      </Box>

      <Typography color={theme.palette.text.secondary} variant="caption">
        {ATTEST_PRESENTED_CREDENTIAL_NOTE}
      </Typography>

      {!credential.schema_name && credential.schema_said && (
        <Box display="flex" flexDirection="column" gap={0.25}>
          <Typography color={theme.palette.text.secondary} variant="caption">
            {ATTEST_PRESENTED_SCHEMA_LABEL}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
            {credential.schema_said}
          </Typography>
        </Box>
      )}

      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography color={theme.palette.text.secondary} variant="caption">
          {ATTEST_PRESENTED_CLAIMS_LABEL}
        </Typography>
        {claimEntries.length > 0 ? (
          claimEntries.map(([key, value]) => (
            <Box key={key} alignItems="baseline" display="flex" flexWrap="wrap" gap={1}>
              <Typography color={theme.palette.text.secondary} variant="body2">
                {humanizeClaimKey(key)}:
              </Typography>
              <Typography sx={{ wordBreak: 'break-word' }} variant="body2">
                {formatClaimValue(value)}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color={theme.palette.text.secondary} variant="body2">
            {ATTEST_PRESENTED_NO_CLAIMS}
          </Typography>
        )}
      </Box>

      {credential.issuer_aid && (
        <Box display="flex" flexDirection="column" gap={0.25}>
          <Typography color={theme.palette.text.secondary} variant="caption">
            {ATTEST_PRESENTED_ISSUER_LABEL}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
            {credential.issuer_aid}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

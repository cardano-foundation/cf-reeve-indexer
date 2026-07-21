import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Clock, CloseCircle, TickCircle } from 'iconsax-react'

import type { CheckStatus, DocumentChecks, DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { CHECK_COPY, CHECKS_ORDER, CHECK_STATUS_LABEL, VERIFIED_CLAIM_SENTENCE } from 'modules/public-document-detail/constants/detail.consts.ts'
import { HonestLimits } from 'modules/public-documents/components/HonestLimits/HonestLimits.component'

type ChecksListProps = {
  checks: DocumentChecks
  verdict: DocumentVerdict
}

const CheckStatusIcon = ({ status }: { status: CheckStatus }) => {
  const theme = useTheme()

  if (status === 'PASS') return <TickCircle color={theme.palette.success.main} size={20} variant="Bold" />
  if (status === 'FAIL') return <CloseCircle color={theme.palette.error.main} size={20} variant="Bold" />
  return <Clock color={theme.palette.text.disabled} size={20} variant="Outline" />
}

/**
 * The four verification checks, in order, each with a status icon and a one-line explanation of
 * what it proves - closed by exactly ONE note: when verdict === 'VERIFIED', the integrity claim
 * sentence verbatim (§9.3); otherwise the honest-limit caveat. Once a document is fully verified the
 * green claim is the single closing statement — the caveat would only duplicate it (and read as an
 * error), so it is not shown here (the documents LIST still renders it on every row, untouched).
 */
export const ChecksList = ({ checks, verdict }: ChecksListProps) => {
  const theme = useTheme()

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" flexDirection="column" gap={1.5}>
        {CHECKS_ORDER.map((key) => {
          const status = checks[key]
          const { label, explanation } = CHECK_COPY[key]

          return (
            <Box key={key} alignItems="flex-start" display="flex" gap={1}>
              <Box sx={{ pt: 0.25 }}>
                <CheckStatusIcon status={status} />
              </Box>
              <Box display="flex" flexDirection="column">
                <Typography color={theme.palette.text.primary} variant="body2">
                  {label} — {CHECK_STATUS_LABEL[status]}
                </Typography>
                <Typography color={theme.palette.text.secondary} variant="caption">
                  {explanation}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>

      {verdict === 'VERIFIED' ? (
        <Alert severity="success">
          <Typography variant="body2">{VERIFIED_CLAIM_SENTENCE}</Typography>
        </Alert>
      ) : (
        <HonestLimits />
      )}
    </Box>
  )
}

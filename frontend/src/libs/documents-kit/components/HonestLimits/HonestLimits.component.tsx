import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { HONEST_LIMIT_VERIFIED_MEANING } from 'modules/public-documents/constants/documents.consts.ts'

/**
 * States the honest limit of this list's verification, verbatim. Must appear on every render of
 * the documents list — do not hide it behind a toggle or tooltip.
 */
export const HonestLimits = () => (
  <Alert severity="info">
    <Box display="flex" flexDirection="column" gap={0.5}>
      <Typography variant="body2">{HONEST_LIMIT_VERIFIED_MEANING}</Typography>
    </Box>
  </Alert>
)

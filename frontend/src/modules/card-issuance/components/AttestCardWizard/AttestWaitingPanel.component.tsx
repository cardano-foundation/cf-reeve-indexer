import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { ATTEST_WAITING_TITLE } from 'modules/card-issuance/constants/attestation.consts'

type Props = { detail: string }

/**
 * The wait state for a ceremony step that blocks on the holder's Veridian wallet.
 *
 * <p>These steps do not block on the network — they block on a person picking up their phone and
 * approving a prompt, which routinely takes tens of seconds. A 16px spinner inside a disabled button
 * gives no indication that anything is expected of the user, so the wait reads as a hung page. This
 * panel says what is being waited on, that the wait is normal, and that the screen updates itself.
 *
 * <p>The progress bar is deliberately INDETERMINATE: there is no progress to report. A bar that
 * appeared to fill would be inventing one, and would then visibly stall.
 */
export const AttestWaitingPanel = ({ detail }: Props) => {
  const theme = useTheme()

  return (
    <Box
      aria-busy="true"
      aria-live="polite"
      display="flex"
      flexDirection="column"
      gap={1}
      sx={{ backgroundColor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle2">{ATTEST_WAITING_TITLE}</Typography>
      <Typography color={theme.palette.text.secondary} variant="body2">
        {detail}
      </Typography>
      <LinearProgress sx={{ borderRadius: 1, mt: 0.5 }} />
    </Box>
  )
}

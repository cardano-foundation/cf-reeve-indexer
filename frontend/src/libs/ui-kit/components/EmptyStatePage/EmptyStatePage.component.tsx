import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

export interface EmptyStatePageProps {
  action?: ReactNode
  asset?: ReactNode
  hint?: string
  message: string
}

export const EmptyStatePage = ({ action, asset, hint, message }: EmptyStatePageProps) => {
  const theme = useTheme()

  return (
    <Box alignItems="center" display="flex" flexDirection="column" gap={6} height="100%" justifyContent="center" margin="auto">
      {asset}
      <Box alignItems="center" display="flex" flexDirection="column" gap={2}>
        <Typography color={theme.palette.text.primary} component="p" textAlign="center" variant="h2">
          {message}
        </Typography>
        {hint && (
          <Typography color={theme.palette.text.secondary} component="p" textAlign="center" variant="body1">
            {hint}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}

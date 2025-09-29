import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

export interface EmptyStateTableProps {
  action?: ReactNode
  asset?: ReactNode
  hint?: string
  message: string
}

export const EmptyStateTable = ({ action, asset, hint, message }: EmptyStateTableProps) => {
  const theme = useTheme()

  return (
    <Box alignItems="center" display="flex" flexDirection="column" gap={3} height="100%" justifyContent="center">
      {asset}
      <Box alignItems="center" display="flex" flexDirection="column" gap={1}>
        <Typography color={theme.palette.text.primary} component="p" textAlign="center" variant="body1">
          {message}
        </Typography>
        {hint && (
          <Typography color={theme.palette.text.secondary} component="p" textAlign="center" variant="body2">
            {hint}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  )
}

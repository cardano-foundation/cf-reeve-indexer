import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import type { DetailRowProps } from './DetailRow.types'

export const DetailRow = ({ label, children, actions }: DetailRowProps) => (
  <Box alignItems="center" display="flex" gap={2}>
    <Box display="flex" flex="1 1 auto" flexDirection="column" gap={0.5} minWidth={0}>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      {children}
    </Box>
    {actions && (
      <Box display="flex" flexShrink={0}>
        {actions}
      </Box>
    )}
  </Box>
)

import Box from '@mui/material/Box'
import { CircularProgressProps as CircularProgressPropsMUI } from '@mui/material/CircularProgress'

import { CircularProgressStyled } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.styles.tsx'

interface LoaderCenteredProps extends CircularProgressPropsMUI {}

export const LoaderCentered = ({ size = 24, variant = 'indeterminate', ...props }: LoaderCenteredProps) => {
  return (
    <Box alignItems="center" display="flex" justifyContent="center">
      <CircularProgressStyled color="primary" size={size} variant={variant} {...props} />
    </Box>
  )
}

import Box, { BoxProps } from '@mui/material/Box'
import { forwardRef } from 'react'

import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'

interface TruncatedCellTextProps extends BoxProps {
  value?: string | number
}

export const TruncatedCellText = forwardRef<HTMLDivElement, TruncatedCellTextProps>(({ value, sx, ...rest }, ref) => (
  <Box ref={ref} maxWidth="100%" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...sx }} {...rest}>
    <CellText value={value} />
  </Box>
))

TruncatedCellText.displayName = 'TruncatedCellText'

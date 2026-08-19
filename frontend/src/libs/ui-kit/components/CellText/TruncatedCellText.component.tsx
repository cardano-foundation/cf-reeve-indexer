import Box from '@mui/material/Box'

import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'

interface TruncatedCellTextProps {
  value?: string | number
}

export const TruncatedCellText = ({ value }: TruncatedCellTextProps) => (
  <Box maxWidth="100%" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
    <CellText value={value} />
  </Box>
)

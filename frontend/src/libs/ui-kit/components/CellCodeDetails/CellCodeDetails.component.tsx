import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'

interface CellCodeDetailsProps {
  code?: string
  description?: string
}

export const CellCodeDetails = ({ code, description }: CellCodeDetailsProps) => {
  const theme = useTheme()

  if (!code && !description) {
    return <CellText />
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" overflow="hidden">
      <Typography variant="body2" color={theme.palette.text.primary} noWrap>
        {code}
      </Typography>
      {description ? (
        <Typography variant="body2" color={theme.palette.text.secondary} noWrap>
          {description}
        </Typography>
      ) : (
        <CellText />
      )}
    </Box>
  )
}

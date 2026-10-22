import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Chart21 } from 'iconsax-react'

export const ChartEmpty = ({ message, hint, height = 240 }: { message: string; hint?: string; height?: number }) => {
  const theme = useTheme()

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={1}
      height={height}
      borderRadius={3}
      border={`1px dashed ${theme.palette.divider}`}
      bgcolor={theme.palette.background.paper}
      px={2}
      textAlign="center"
    >
      <Chart21 size={28} color={theme.palette.text.disabled} />
      <Typography color="text.secondary" variant="body2" fontWeight={500}>
        {message}
      </Typography>
      {hint && (
        <Typography color="text.disabled" variant="caption">
          {hint}
        </Typography>
      )}
    </Box>
  )
}

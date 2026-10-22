import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: string
  hint?: string
  icon: ReactNode
  isLoading?: boolean
  onClick?: () => void
}

export const StatTile = ({ label, value, hint, icon, isLoading, onClick }: StatTileProps) => {
  const theme = useTheme()

  return (
    <ButtonBase
      disabled={!onClick}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 2,
        width: '100%',
        height: '100%',
        p: { xs: 2, sm: 3 },
        textAlign: 'left',
        bgcolor: theme.palette.background.default,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:hover': { borderColor: theme.palette.primary.light, boxShadow: `0 4px 16px ${theme.palette.divider}` }
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography color="text.secondary" variant="body2" fontWeight={500}>
          {label}
        </Typography>
        <Box display="flex" color={theme.palette.text.secondary}>
          {icon}
        </Box>
      </Box>
      <Box>
        {isLoading ? (
          <Skeleton variant="text" width="60%" sx={{ fontSize: '2.25rem' }} />
        ) : (
          <Typography color="text.primary" component="p" fontSize="2.25rem" fontWeight={600} lineHeight={1.1} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
        )}
        {hint && (
          <Typography color="text.secondary" variant="caption" mt={0.5} display="block">
            {hint}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  )
}

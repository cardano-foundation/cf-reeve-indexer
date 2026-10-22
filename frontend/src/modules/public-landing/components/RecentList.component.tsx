import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

export interface RecentListRow {
  key: string | number
  primary: ReactNode
  secondary?: ReactNode
  trailing?: ReactNode
  trailingHint?: ReactNode
  onClick?: () => void
}

export const RecentList = ({ rows, emptyMessage }: { rows: RecentListRow[]; emptyMessage: string }) => {
  const theme = useTheme()

  if (rows.length === 0) {
    return (
      <Typography color="text.disabled" variant="body2" py={2}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <Box display="flex" flexDirection="column">
      {rows.map((row, index) => (
        <ButtonBase
          key={row.key}
          disabled={!row.onClick}
          onClick={row.onClick}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 1.5,
            px: 1,
            mx: -1,
            textAlign: 'left',
            borderRadius: 2,
            borderTop: index === 0 ? 'none' : `1px solid ${theme.palette.divider}`,
            '&:hover': { bgcolor: theme.palette.background.paper }
          }}
        >
          <Box minWidth={0}>
            <Typography color="text.primary" variant="body2" fontWeight={500} noWrap>
              {row.primary}
            </Typography>
            {row.secondary && (
              <Typography color="text.secondary" variant="caption" noWrap component="div">
                {row.secondary}
              </Typography>
            )}
          </Box>
          {(row.trailing || row.trailingHint) && (
            <Box textAlign="right" flexShrink={0}>
              {row.trailing && (
                <Typography color="text.primary" variant="body2" fontWeight={500} sx={{ fontVariantNumeric: 'tabular-nums' }} component="div">
                  {row.trailing}
                </Typography>
              )}
              {row.trailingHint && (
                <Typography color="text.secondary" variant="caption" component="div">
                  {row.trailingHint}
                </Typography>
              )}
            </Box>
          )}
        </ButtonBase>
      ))}
    </Box>
  )
}

import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { LabelCount } from 'libs/api-connectors/backend-connector-reeve/api/overview/overviewApi.types.ts'
import { ACTIVITY_COLOR, formatCount, humanize } from 'modules/public-landing/utils/dashboard.ts'

interface BreakdownBarsProps {
  title: string
  items: LabelCount[]
  limit?: number
  formatLabel?: (label: string) => string
}

/** Ranked horizontal bars: one hue, length encodes count, value printed in text ink beside it. */
export const BreakdownBars = ({ title, items, limit = 5, formatLabel = humanize }: BreakdownBarsProps) => {
  const theme = useTheme()

  const total = items.reduce((sum, item) => sum + item.count, 0)
  const shown = items.slice(0, limit)
  const rest = items.slice(limit).reduce((sum, item) => sum + item.count, 0)
  const rows = rest > 0 ? [...shown, { label: 'Other', count: rest }] : shown
  const max = Math.max(...rows.map((row) => row.count), 1)

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography color="text.disabled" variant="body2">
          —
        </Typography>
      ) : (
        rows.map((row) => (
          <Tooltip key={row.label} title={`${formatCount(row.count)} · ${total ? Math.round((row.count / total) * 100) : 0}%`} placement="top-start">
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Typography color="text.primary" variant="body2" noWrap>
                  {formatLabel(row.label)}
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCount(row.count)}
                </Typography>
              </Box>
              <Box height={6} borderRadius={3} bgcolor={theme.palette.background.paper} overflow="hidden">
                <Box height="100%" width={`${(row.count / max) * 100}%`} minWidth={4} borderRadius={3} bgcolor={ACTIVITY_COLOR} />
              </Box>
            </Box>
          </Tooltip>
        ))
      )}
    </Box>
  )
}

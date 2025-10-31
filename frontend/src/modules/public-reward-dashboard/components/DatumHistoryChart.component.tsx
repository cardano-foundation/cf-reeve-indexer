import { useMemo, useState, useEffect } from 'react'
import { Typography, Box } from 'features/mui/base'
import { useTheme, CircularProgress } from '@mui/material'
import { Activity } from 'iconsax-react'
import { ContractResponse } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi.types'
import { ChartLineDashboards } from 'libs/data-visualisation-kit/components/ChartLineDashboards/ChartLineDashboards.component'
import { caslChartColors } from 'libs/ui-kit/theme/colors'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component'
import { mapValuesToNumbers, snakeCaseToTitleCase } from 'modules/public-reward-dashboard/utils/formatUtils'

interface DatumHistoryChartProps {
  data: ContractResponse[]
  isLoading: boolean
}

export const DatumHistoryChart = ({ data, isLoading }: DatumHistoryChartProps) => {
  const theme = useTheme()

  // 1️⃣ Sort by timestamp
  const sortedData = useMemo(
    () => [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [data]
  )

  // 2️⃣ Convert datum_data into numeric rows
  const dataset = useMemo(() => {
    return sortedData.map((item) => ({
      timestamp: new Date(item.timestamp),
      ...mapValuesToNumbers(item.datum_data),
    }))
  }, [sortedData])

  // 3️⃣ Identify available numeric keys
  const availableKeys = useMemo(() => {
    const set = new Set<string>()
    dataset.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== 'timestamp' && typeof (row as any)[key] === 'number') set.add(key)
      })
    })
    return Array.from(set)
  }, [dataset])

  // Default to ADA price series if present
  const [enabledSeries, setEnabledSeries] = useState<string[]>([])

  useEffect(() => {
    if (availableKeys.length > 0) {
      const defaultSeries = availableKeys.find((k) => k.toLowerCase().includes('price')) ?? availableKeys[0]
      setEnabledSeries([defaultSeries])
    }
  }, [availableKeys])

  const toggleSeries = (key: string) => {
    setEnabledSeries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          borderRadius: 3,
          padding: 6,
          textAlign: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        <CircularProgress sx={{ mb: 2, color: caslChartColors.cyan[600] }} size={48} />
        <Typography variant="body1">Loading ADA price data...</Typography>
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          borderRadius: 3,
          padding: 6,
          textAlign: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.primary }}>
          No Historical Data
        </Typography>
        <Typography variant="body2">No data points available for ADA price history.</Typography>
      </Box>
    )
  }

  // 4️⃣ Prepare chart series
  const colors = [
    theme.palette.primary.dark,
    caslChartColors.cyan[600],
    caslChartColors.cyan[800],
    theme.palette.success.main,
  ]

  const series = enabledSeries.map((key, i) => ({
    id: key,
    label: snakeCaseToTitleCase(key),
    dataKey: key,
    connectNulls: true,
    showMark: true,
    curve: 'monotoneX' as const,
    markSize: 8,
    valueFormatter: (v: number | null) => (v != null ? v.toFixed(4) : '-'),
  }))

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        borderRadius: 3,
        padding: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
          pb: 2,
          borderBottom: `2px solid ${theme.palette.divider}`,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 220 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Activity size={28} variant="Bold" color={theme.palette.primary.dark} />
            ADA Price Timeline
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
          >
            {sortedData.length} data points
          </Typography>
        </Box>

        {/* Series toggles */}
        {availableKeys.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              flex: 1,
            }}
          >
            {availableKeys.map((key, index) => {
              const active = enabledSeries.includes(key)
              const color = colors[index % colors.length]
              return (
                <Chip
                  key={key}
                  label={snakeCaseToTitleCase(key)}
                  onClick={() => toggleSeries(key)}
                  icon={
                    <Box
                      component="span"
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  }
                  sx={{
                    backgroundColor: active ? color : theme.palette.background.paper,
                    color: active ? theme.palette.common.white : theme.palette.text.secondary,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${active ? color : theme.palette.divider}`,
                    boxShadow: active ? '0 4px 10px rgba(0, 0, 0, 0.15)' : 'none',
                    opacity: active ? 1 : 0.7,
                    height: 30,
                    '& .MuiChip-label': { fontSize: 13 },
                    '& .MuiChip-icon': {
                      margin: 0,
                      marginRight: theme.spacing(1),
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                      opacity: 1,
                    },
                  }}
                />
              )
            })}
          </Box>
        )}
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: 420 }}>
        <ChartLineDashboards
          colors={colors}
          series={series}
          dataset={dataset}
          xAxis={{
            dataKey: 'timestamp',
            scaleType: 'time',
            valueFormatter: (v) =>
              new Date(v).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
          }}
          height={420}
          isLegendHidden={false}
          showPoints={false}
        />
      </Box>
    </Box>
  )
}

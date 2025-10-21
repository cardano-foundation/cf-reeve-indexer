import { useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { Activity } from 'iconsax-react'

import { ContractResponse } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi.types'
import { ChartLineDashboards } from 'libs/data-visualisation-kit/components/ChartLineDashboards/ChartLineDashboards.component'
import { chartColors } from 'libs/ui-kit/theme/colors'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component'
import { mapValuesToNumbers, snakeCaseToTitleCase } from 'modules/public-reports-v2/utils/formatUtils'

interface DatumHistoryChartProps {
  data: ContractResponse[]
  isLoading: boolean
}

type ChartRow = Record<string, number | null> & { timestamp: Date }

export const DatumHistoryChart = ({ data, isLoading }: DatumHistoryChartProps) => {
  const theme = useTheme()

  const sortedData = useMemo(
    () => [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [data]
  )

  const seriesKeys = useMemo(() => {
    const orderedKeys: string[] = []
    const seenKeys = new Set<string>()

    sortedData.forEach((item) => {
      if (!item.datum_data) {
        return
      }

      const values = mapValuesToNumbers(item.datum_data)

      Object.keys(values).forEach((key) => {
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          orderedKeys.push(key)
        }
      })
    })

    return orderedKeys
  }, [sortedData])

  const chartDataset = useMemo<ChartRow[]>(() => {
    if (sortedData.length === 0 || seriesKeys.length === 0) {
      return []
    }

    return sortedData.map((item) => {
      const row: ChartRow = { timestamp: new Date(item.timestamp) }
      const values = mapValuesToNumbers(item.datum_data)

      seriesKeys.forEach((key) => {
        const hasValue = Object.prototype.hasOwnProperty.call(values, key)
        const rawValue = hasValue ? values[key] : undefined
        row[key] = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null
      })

      return row
    })
  }, [seriesKeys, sortedData])

  const [enabledSeries, setEnabledSeries] = useState<string[]>([])

  useEffect(() => {
    setEnabledSeries((prev) => {
      const isSameLength = prev.length === seriesKeys.length
      const hasSameOrder = isSameLength && prev.every((key, index) => key === seriesKeys[index])

      return hasSameOrder ? prev : seriesKeys
    })
  }, [seriesKeys])

  const allSeries = useMemo(
    () =>
      seriesKeys.map((key) => ({
        id: key,
        label: snakeCaseToTitleCase(key),
        data: chartDataset.map((row) => row[key]),
      })),
    [chartDataset, seriesKeys]
  )

  const series = useMemo(
    () =>
      allSeries
        .filter((s) => s.id && enabledSeries.includes(s.id))
        .map((s) => ({
          ...s,
          connectNulls: true,
          curve: 'monotoneX' as const,
          showMark: true,
          shape: 'circle' as const,
          markSize: 8,
        })),
    [allSeries, enabledSeries]
  )

  const timestamps = useMemo(() => chartDataset.map((row) => row.timestamp), [chartDataset])

  // Zoom & pan state for x-axis (in ms)
  const [xDomain, setXDomain] = useState<{ min: number; max: number } | null>(null)
  const totalDomain = useMemo(() => {
    if (timestamps.length === 0) return null
    const min = timestamps[0].getTime()
    const max = timestamps[timestamps.length - 1].getTime()
    return { min, max }
  }, [timestamps])

  // Initialize domain to full range when data changes
  useEffect(() => {
    if (totalDomain) {
      setXDomain({ ...totalDomain })
    } else {
      setXDomain(null)
    }
  }, [totalDomain])

  // Pointer-based zoom & pan handlers
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<{ x: number; domain: { min: number; max: number } } | null>(null)

  const clampDomain = (min: number, max: number) => {
    if (!totalDomain) return { min, max }
    const totalMin = totalDomain.min
    const totalMax = totalDomain.max
    const span = max - min
    const totalSpan = totalMax - totalMin
    const minSpan = Math.max(totalSpan / 500, 1) // avoid collapsing to 0

    let newMin = min
    let newMax = max

    if (span < minSpan) {
      const center = (min + max) / 2
      newMin = center - minSpan / 2
      newMax = center + minSpan / 2
    }

    if (newMin < totalMin) {
      const diff = totalMin - newMin
      newMin += diff
      newMax += diff
    }
    if (newMax > totalMax) {
      const diff = newMax - totalMax
      newMin -= diff
      newMax -= diff
    }
    // Final clamp to total bounds
    newMin = Math.max(newMin, totalMin)
    newMax = Math.min(newMax, totalMax)
    return { min: newMin, max: newMax }
  }

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!xDomain || !totalDomain) return
    e.preventDefault()
    const span = xDomain.max - xDomain.min
    const zoomFactor = 0.1 // 10% per wheel step
    const direction = e.deltaY > 0 ? 1 : -1
    const newSpan = Math.min(totalDomain.max - totalDomain.min, Math.max(1, span * (1 + direction * zoomFactor)))
    const center = (xDomain.min + xDomain.max) / 2
    const newMin = center - newSpan / 2
    const newMax = center + newSpan / 2
    setXDomain(clampDomain(newMin, newMax))
  }

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!xDomain) return
    dragStartRef.current = { x: e.clientX, domain: { ...xDomain } }
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing'
    }
  }

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const start = dragStartRef.current
    if (!start || !containerRef.current) return
    const width = containerRef.current.clientWidth || 1
    const dxPx = e.clientX - start.x
    const span = start.domain.max - start.domain.min
    const dt = (dxPx / width) * span
    const newMin = start.domain.min - dt
    const newMax = start.domain.max - dt
    setXDomain(clampDomain(newMin, newMax))
  }

  const endDrag = () => {
    dragStartRef.current = null
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }

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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        <CircularProgress sx={{ mb: 2, color: chartColors.blue[600] }} size={48} />
        <Typography variant="body1">Loading chart data...</Typography>
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.primary }}>
          No Historical Data
        </Typography>
        <Typography variant="body2">No data points available to display in the chart.</Typography>
      </Box>
    )
  }

  const colors = [
    chartColors.blue[700],    // Primary blue #0084FF
    chartColors.green[700],   // Teal/green #00BE7A
    chartColors.cyan[600],    // Cyan #00E0FF
    chartColors.blue[600],    // Light blue #55ADFF
    chartColors.green[600],   // Light green #55D4A6
    chartColors.cyan[800],    // Dark cyan #00BBD4
  ]

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        borderRadius: 3,
        padding: 3,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
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
          <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={28} variant="Bold" color={chartColors.blue[700]} />
            Data Timeline
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            {sortedData.length} data points
          </Typography>
        </Box>

        {seriesKeys.length > 0 && (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            flex: 1,
          }}>
            {seriesKeys.map((key, index) => {
              const active = enabledSeries.includes(key)
              const color = colors[index % colors.length]
              return (
                <Chip
                  key={key}
                  label={snakeCaseToTitleCase(key)}
                  onClick={() => toggleSeries(key)}
                  icon={(
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
                  )}
                  sx={{
                    backgroundColor: active ? color : theme.palette.background.paper,
                    color: active ? theme.palette.common.white : theme.palette.text.secondary,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${active ? color : theme.palette.divider}`,
                    boxShadow: active ? '0 4px 10px rgba(0, 0, 0, 0.15)' : 'none',
                    opacity: active ? 1 : 0.7,
                    // make chip a bit bigger
                    height: 30,
                    '& .MuiChip-label': {
                      fontSize: 13,
                    },
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

      <Box
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        sx={{ width: '100%', height: 420, cursor: 'grab' }}
      >
        {series.length > 0 ? (
          <ChartLineDashboards
            colors={colors}
            series={series}
            xAxis={{
              scaleType: 'time',
              data: timestamps,
              min: xDomain ? new Date(xDomain.min) : undefined,
              max: xDomain ? new Date(xDomain.max) : undefined,
              valueFormatter: (value) => {
                const date = value instanceof Date ? value : new Date(value)
                if (Number.isNaN(date.getTime())) {
                  return ''
                }
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              },
            }}
            height={420}
            isLegendHidden={false}
            sx={{
              '& .MuiLineElement-root': {
                strokeWidth: 3,
              },
              '& .MuiMarkElement-root': {
                scale: '1.5',
                fill: 'white',
                strokeWidth: 3,
              },
              '& .MuiChartsAxis-tickLabel': {
                fill: theme.palette.text.secondary,
                fontSize: '11px',
                fontWeight: 500,
              },
              '& .MuiChartsAxis-line': {
                stroke: theme.palette.divider,
              },
              '& .MuiChartsGrid-line': {
                stroke: theme.palette.divider,
                strokeOpacity: 0.3,
              },
              '& .MuiChartsLegend-root': {
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: theme.spacing(1.5),
              },
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="body1">Select at least one series to display</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

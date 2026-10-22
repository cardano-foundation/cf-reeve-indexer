import dayjs from 'dayjs'

import { formatNumber } from 'libs/utils/format.ts'

/**
 * Categorical colours for the funding flow series, validated (lightness band, chroma floor, CVD and
 * normal-vision separation, 3:1 contrast) against the light surface. Kept in a fixed order so a series
 * always wears the same colour regardless of which series are present.
 */
export const FUNDING_COLORS = {
  funded: '#247EE0',
  spent: '#B27318',
  refunded: '#7572D9'
} as const

export const ACTIVITY_COLOR = FUNDING_COLORS.funded

export const MONTHS_SHOWN = 12

/** {@code BALANCE_SHEET} / {@code VendorPayment} -> {@code Balance sheet} / {@code Vendor payment}. */
export const humanize = (value?: string | null) => {
  if (!value) return '—'

  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()

  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export const formatCount = (value: number | null | undefined) => formatNumber(value ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const formatCompactAmount = (value: number | null | undefined) => formatNumber(value ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'compact' })

export const formatMonth = (month: string) => dayjs(`${month}-01`).format('MMM YY')

export const formatDate = (date?: string | null) => (date ? dayjs(date).format('DD MMM YYYY') : '—')

export const shortHash = (hash?: string | null) => (hash && hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : (hash ?? '—'))

/**
 * Pads a sparse {@code yyyy-MM} series into the {@link MONTHS_SHOWN} consecutive months ending at its
 * latest month, so gaps render as empty slots instead of the axis silently skipping them. Anchored to
 * the data rather than today because indexed data is often historical.
 */
export const lastMonths = <T extends { month: string }>(series: T[] | undefined, empty: (month: string) => T): T[] => {
  if (!series?.length) return []

  const byMonth = new Map(series.map((entry) => [entry.month, entry]))
  const end = dayjs(`${series[series.length - 1].month}-01`)

  return Array.from({ length: MONTHS_SHOWN }, (_, i) => end.subtract(MONTHS_SHOWN - 1 - i, 'month').format('YYYY-MM')).map((month) => byMonth.get(month) ?? empty(month))
}

export const formatReportPeriod = (interval?: string, year?: number, period?: number) => {
  if (!year) return '—'

  switch (interval) {
    case 'MONTH':
      return period ? dayjs(`${year}-${String(period).padStart(2, '0')}-01`).format('MMM YYYY') : String(year)
    case 'QUARTER':
      return period ? `Q${period} ${year}` : String(year)
    default:
      return `FY ${year}`
  }
}

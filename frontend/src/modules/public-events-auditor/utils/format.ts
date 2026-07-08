import dayjs from 'dayjs'

import { formatNumber } from 'libs/utils/format.ts'

/**
 * Formats a monetary amount with the organisation's reporting currency appended as a plain suffix.
 * The currency here is an organisation-defined customer code (not necessarily an ISO 4217 code), so
 * we deliberately avoid {@code Intl.NumberFormat}'s currency style, which throws on unknown codes.
 */
export const formatAuditAmount = (value: number | null | undefined, currency?: string | null, compact = false): string => {
  if (value === null || value === undefined) return '—'

  const formatted = formatNumber(value, compact ? { minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'compact' } : {})

  return currency ? `${formatted} ${currency}` : formatted
}

export const formatAuditDate = (value: string | null | undefined): string => (value ? dayjs(value, 'YYYY-MM-DD').format('DD/MM/YYYY') : '—')

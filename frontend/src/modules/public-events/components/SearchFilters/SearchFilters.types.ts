import type { Dayjs } from 'dayjs'

export interface SearchFiltersValues extends Record<string, unknown> {
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  eventType: string[]
  maxAmount: string
  minAmount: string
  project: string[]
}

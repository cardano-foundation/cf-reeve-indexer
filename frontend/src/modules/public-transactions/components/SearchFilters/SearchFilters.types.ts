import type { Dayjs } from 'dayjs'

export interface SearchFiltersValues extends Record<string, unknown> {
  costCenter: string[]
  counterparty: string[]
  counterpartyType: string[]
  currency: string[]
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  documentNumber: string[]
  event: string[]
  minAmount: string
  maxAmount: string
  project: string[]
  transactionNumber: string[]
  transactionType: string[]
  vatCode: string[]
}

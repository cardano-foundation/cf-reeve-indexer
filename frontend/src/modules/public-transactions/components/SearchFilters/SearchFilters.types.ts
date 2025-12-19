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
  minAmountFcy: string
  maxAmountFcy: string
  minAmountLcy: string
  maxAmountLcy: string
  project: string[]
  transactionNumber: string[]
  transactionType: string[]
  vatCode: string[]
}

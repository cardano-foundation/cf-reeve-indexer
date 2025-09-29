import { Dayjs } from 'dayjs'

export interface PublicTransactionsFormValues {
  organisation: string
  dateFrom: Dayjs | undefined
  dateTo: Dayjs | undefined
  currency: string
  minAmount: string
  maxAmount: string
  blockchainHash: string
}

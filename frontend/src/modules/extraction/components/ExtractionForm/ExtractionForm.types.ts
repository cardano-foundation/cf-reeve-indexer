import { Dayjs } from 'dayjs'

export interface ExtractionFormValues {
  organisation: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  costCenter: string[]
  project: string[]
  accountType: string[]
  accountSubtype: string[]
  accountCode: string[]
}

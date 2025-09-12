import { Dayjs } from 'dayjs'

export interface ReconciliationFormValues {
  organisation: string
  dataSource: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
}

import { Dayjs } from 'dayjs'

export enum ImportType {
  ERP = 'ERP',
  FILE = 'FILE'
}

export interface ImportFormValues {
  organisation: string
  importType: ImportType
  dataSource: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  transactionTypes: string[]
  transactionNumbers: string
  file: File | null
}

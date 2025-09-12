import type { Dayjs } from 'dayjs'

import { DEFAULT_DRAWER_FILTERS_VALUES } from './batch-details-filters.consts'

export interface BatchDetailsFiltersValues {
  accountCredit: string[]
  accountDebit: string[]
  costCenterChild: string[]
  costCenterParent: string[]
  counterparty: string[]
  counterpartyType: string[]
  currency: string[]
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  documentNumbers: string[]
  event: string[]
  minAmountFCY: string
  maxAmountFCY: string
  minAmountLCY: string
  maxAmountLCY: string
  minTotalAmountLCY: string
  maxTotalAmountLCY: string
  projectChild: string[]
  projectParent: string[]
  transactionType: string[]
  vatCode: string[]
}

export interface BatchDetailsDrawerFiltersState {
  initialValues: typeof DEFAULT_DRAWER_FILTERS_VALUES
  onApplyFilters?: (payload: Partial<BatchDetailsFiltersValues>) => void
}

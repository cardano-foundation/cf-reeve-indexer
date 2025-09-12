import type { BatchDetailsFiltersValues } from './batch-details-filters.types'

export const DEFAULT_DRAWER_FILTERS_VALUES: BatchDetailsFiltersValues = {
  accountCredit: [],
  accountDebit: [],
  costCenterChild: [],
  costCenterParent: [],
  counterparty: [],
  counterpartyType: [],
  currency: [],
  dateFrom: null,
  dateTo: null,
  documentNumbers: [],
  event: [],
  minAmountFCY: '',
  maxAmountFCY: '',
  minAmountLCY: '',
  maxAmountLCY: '',
  minTotalAmountLCY: '',
  maxTotalAmountLCY: '',
  projectChild: [],
  projectParent: [],
  transactionType: [],
  vatCode: []
}

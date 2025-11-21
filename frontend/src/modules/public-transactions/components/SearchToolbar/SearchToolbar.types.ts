import { type Dayjs } from 'dayjs'

import { useSearchFiltersOptions } from 'modules/public-transactions/components/SearchFilters/SearchFilters.hooks'

export interface SearchQuickFiltersValues extends Record<string, unknown> {
  search: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  transactionNumber: string[]
  transactionType: string[]
}

export interface SearchQuickFiltersProps {
  options: Pick<ReturnType<typeof useSearchFiltersOptions>, 'transactionNumbersOptions' | 'transactionTypeOptions'>
}

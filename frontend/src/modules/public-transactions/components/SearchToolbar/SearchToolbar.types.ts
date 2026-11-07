import { type Dayjs } from 'dayjs'
import { type MouseEvent } from 'react'

import { useSearchFiltersOptions } from 'modules/public-transactions/components/SearchFilters/SearchFilters.hooks'

export interface SearchQuickFiltersValues extends Record<string, unknown> {
  search: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  transactionNumber: string[]
  transactionType: string[]
}

export interface SearchToolbarProps {
  columnsPanelId: string
  isColumnsOpen: boolean
  onColumnsToggle: (event: MouseEvent<HTMLElement>) => void
}

export interface SearchQuickFiltersProps {
  options: Pick<ReturnType<typeof useSearchFiltersOptions>, 'transactionNumberOptions' | 'transactionTypeOptions' | 'transactionNumberSearchTerm' | 'setTransactionNumberSearchTerm' | 'debouncedTransactionNumberSearchTerm'>
}

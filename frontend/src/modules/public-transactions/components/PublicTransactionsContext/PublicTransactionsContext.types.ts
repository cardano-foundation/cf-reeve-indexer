import { type ReactNode } from 'react'

import { useSearchFiltersOptions } from 'modules/public-transactions/components/SearchFilters/SearchFilters.hooks'
import { usePublicTransactionsFilters } from 'modules/public-transactions/hooks/usePublicTransactionsFilters'

export interface PublicTransactionsContextProps {
  filters: ReturnType<typeof usePublicTransactionsFilters>
  options: ReturnType<typeof useSearchFiltersOptions>
}

export interface PublicTransactionsContextProviderProps {
  children: ReactNode
  value: PublicTransactionsContextProps
}

import { type ReactNode } from 'react'

import { useSearchFiltersOptions } from 'modules/public-events/components/SearchFilters/SearchFilters.hooks'
import { usePublicEventsFilters } from 'modules/public-events/hooks/usePublicEventsFilters'

export interface PublicEventsContextProps {
  filters: ReturnType<typeof usePublicEventsFilters>
  options: ReturnType<typeof useSearchFiltersOptions>
}

export interface PublicEventsContextProviderProps {
  children: ReactNode
  value: PublicEventsContextProps
}

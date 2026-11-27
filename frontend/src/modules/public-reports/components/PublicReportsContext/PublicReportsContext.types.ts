import { type ReactNode } from 'react'

import { useSorting } from 'libs/hooks/useSorting'
import { useReportsFiltersOptions } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.hooks'
import { usePublicReportsFilters } from 'modules/public-reports/hooks/usePublicReportsFilters'

export interface PublicReportsContextProps {
  filters: ReturnType<typeof usePublicReportsFilters>
  options: ReturnType<typeof useReportsFiltersOptions>
  sorting: ReturnType<typeof useSorting>
}

export interface PublicReportsContextProviderProps {
  children: ReactNode
  value: PublicReportsContextProps
}

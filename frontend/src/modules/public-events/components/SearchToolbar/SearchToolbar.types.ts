import { type Dayjs } from 'dayjs'

import { useSearchFiltersOptions } from 'modules/public-events/components/SearchFilters/SearchFilters.hooks'

export interface SearchQuickFiltersValues extends Record<string, unknown> {
  search: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  eventType: string[]
  project: string[]
}

export interface SearchQuickFiltersProps {
  options: Pick<ReturnType<typeof useSearchFiltersOptions>, 'eventTypeOptions' | 'projectOptions'>
}

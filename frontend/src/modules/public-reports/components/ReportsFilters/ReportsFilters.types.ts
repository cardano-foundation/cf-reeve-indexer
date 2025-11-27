import { useReportsFiltersOptions } from './ReportsFilters.hooks'

export interface ReportsFiltersValues extends Record<string, unknown> {
  report: string[]
  period: string[]
}

export interface ReportsFiltersProps {
  options: ReturnType<typeof useReportsFiltersOptions>
  isAllReports?: boolean
  isPublish?: boolean
}

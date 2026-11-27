import { useReportsFiltersOptions } from './ReportsFilters.hooks'

export interface ReportsFiltersValues extends Record<string, unknown> {
  search: string
  report: string[]
  period: string[]
  standard: string[]
  attestedOnly: boolean
}

export interface ReportsFiltersProps {
  options: ReturnType<typeof useReportsFiltersOptions>
  isAllReports?: boolean
  isPublish?: boolean
}

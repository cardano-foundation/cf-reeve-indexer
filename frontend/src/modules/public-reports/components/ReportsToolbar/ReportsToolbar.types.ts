import { useReportsFiltersOptions } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.hooks'

export interface ReportsQuickFiltersValues extends Record<string, unknown> {
  search: string
  report: string[]
  period: string[]
}

export interface ReportsQuickFiltersProps {
  options: ReturnType<typeof useReportsFiltersOptions>
}

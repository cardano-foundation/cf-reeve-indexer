import { ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export interface PublicReportsFiltersFormValues {
  period: string
  report: ReportType | string
}

import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'

export interface PublicReportsFiltersFormValues {
  period: string
  report: ReportType | string
}

import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

export interface PublicReportsFiltersFormValues {
  period: string
  report: ReportType | string
}

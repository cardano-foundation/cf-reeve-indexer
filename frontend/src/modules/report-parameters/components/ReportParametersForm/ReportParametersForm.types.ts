import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types.ts'

export interface ReportParametersFormValues {
  report: ReportType
  period: string
  currency: string
  isAutomaticGeneration: boolean
}

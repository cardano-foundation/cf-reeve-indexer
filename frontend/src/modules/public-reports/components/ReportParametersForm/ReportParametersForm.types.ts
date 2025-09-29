import { ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'

export interface ReportParametersFormValues {
  report: ReportType
  period: string
  currency: string
  isAutomaticGeneration: boolean
}

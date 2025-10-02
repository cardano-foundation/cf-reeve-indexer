import type { ReportApiResponse } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export type ModalReportProps = {
  report: ReportApiResponse
  onClose: () => void
  hasNonPublishedReportForThePeriod?: undefined
  hasPublishedReportForThePeriod?: undefined
  isOpen: boolean
  isPreviewMode?: false
}
export interface ModalReportState {
  report: ReportApiResponse
}

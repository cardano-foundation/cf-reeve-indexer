import type { ReportApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

interface ModalReportNonPreviewProps {
  report: ReportApiResponse
  onClose: () => void
  hasNonPublishedReportForThePeriod?: undefined
  hasPublishedReportForThePeriod?: undefined
  isOpen: boolean
  isPreviewMode?: false
}

interface ModalReportPreviewProps {
  report: ReportApiResponse
  onClose: () => void
  hasNonPublishedReportForThePeriod: boolean
  hasPublishedReportForThePeriod: boolean
  isOpen: boolean
  isPreviewMode: true
}

export type ModalReportProps = ModalReportNonPreviewProps | ModalReportPreviewProps

export interface ModalReportState {
  report: ReportApiResponse
}

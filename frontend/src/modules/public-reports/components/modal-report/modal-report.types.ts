import type { ReactNode } from 'react'

import type { ReportApiResponse, ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export interface ReportDetailsProps {
  report: ReportEntity
}

export interface ReportDetailRow {
  label: string
  value: ReactNode
  actions?: ReactNode
}

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

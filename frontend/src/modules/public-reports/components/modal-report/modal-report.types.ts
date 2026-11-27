import type { ReactNode } from 'react'

import type { ReportApiResponse, ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import type { AttestationKind } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.types'

export interface ReportDetailsProps {
  report: ReportEntity
  onAttestationSelect: (kind: AttestationKind) => void
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

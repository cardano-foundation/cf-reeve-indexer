import type { GetPublicReportsResponse200, ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import type { AttestationKind } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.types'

export interface ReportCardsProps {
  data: GetPublicReportsResponse200 | null
  hasFiltersSelected: boolean
  isFetching: boolean
  isAttestationsLoading: boolean
  onViewOpen: (report: ReportEntity) => void
  onAttestationSelect: (report: ReportEntity, kind: AttestationKind) => void
  onLoadMore: () => void
}

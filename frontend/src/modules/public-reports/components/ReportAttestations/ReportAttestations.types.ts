import type { ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import type { AttestationKind } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.types'

export interface ReportAttestationsProps {
  report: ReportEntity
  isLoading: boolean
  onSelect: (kind: AttestationKind) => void
}

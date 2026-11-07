import type { AttestationKind } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.types'

export interface AttestationButtonProps {
  kind: AttestationKind
  isAvailable: boolean
  onClick: () => void
}

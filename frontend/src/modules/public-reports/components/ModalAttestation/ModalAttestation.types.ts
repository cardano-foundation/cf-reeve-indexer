import { ReactNode } from 'react'

import { ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export type AttestationKind = 'organisation' | 'auditor'

export interface SelectedAttestation {
  report: ReportEntity
  kind: AttestationKind
}

export interface ModalAttestationProps extends SelectedAttestation {
  onClose: () => void
}

export type CopyState = 'idle' | 'copied' | 'failed'

export interface AttestationRowProps {
  label: string
  children: ReactNode
  actions?: ReactNode
}

export interface AttestationCopyButtonProps {
  label: string
  value: string
}

export interface AttestationExplorerLinkProps {
  value: string
}

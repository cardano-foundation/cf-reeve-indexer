import { Buliding, SecurityUser } from 'iconsax-react'

import type { AttestationKind } from './ModalAttestation.types'

export const ATTESTATION_KINDS: AttestationKind[] = ['organisation', 'auditor']

export const ATTESTATION_CONFIG = {
  organisation: { icon: Buliding, titleId: 'attestationOrganisation', descriptionId: 'attestationOrganisationDescription' },
  auditor: { icon: SecurityUser, titleId: 'attestationAuditor', descriptionId: 'attestationAuditorDescription' }
} satisfies Record<AttestationKind, { icon: typeof Buliding; titleId: string; descriptionId: string }>

export const COPY_RESET_DELAY = 2000

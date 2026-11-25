import { Buliding, SecurityUser } from 'iconsax-react'

import type { AttestationKind } from './ModalAttestation.types'

export const ATTESTATION_KINDS: AttestationKind[] = ['organisation', 'auditor']

export const ATTESTATION_CONFIG = {
  organisation: { icon: Buliding, labelId: 'organization', titleId: 'attestationOrganisation', descriptionId: 'attestationOrganisationDescription' },
  auditor: { icon: SecurityUser, labelId: 'auditor', titleId: 'attestationAuditor', descriptionId: 'attestationAuditorDescription' }
} satisfies Record<AttestationKind, { icon: typeof Buliding; labelId: string; titleId: string; descriptionId: string }>

export const COPY_RESET_DELAY = 2000

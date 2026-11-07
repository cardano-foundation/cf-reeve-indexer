import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors, verifyColors } from 'libs/ui-kit/theme/colors.ts'
import { ATTESTATION_CONFIG } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.consts'

import { AttestationButtonStyled } from './AttestationButton.styles'
import type { AttestationButtonProps } from './AttestationButton.types'

export const AttestationButton = ({ kind, isAvailable, onClick }: AttestationButtonProps) => {
  const { t } = useTranslations()

  const { icon: KindIcon, titleId } = ATTESTATION_CONFIG[kind]
  const title = t({ id: titleId })

  return (
    <Tooltip title={title}>
      <AttestationButtonStyled
        aria-haspopup="dialog"
        aria-label={t({ id: isAvailable ? 'attestationAvailableLabel' : 'attestationPendingLabel' }, { attestation: title })}
        onClick={onClick}
      >
        <KindIcon color={isAvailable ? verifyColors.blue[600] : colors.neutral[600]} size={24} variant="Outline" />
      </AttestationButtonStyled>
    </Tooltip>
  )
}

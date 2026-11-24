import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { ATTESTATION_CONFIG, ATTESTATION_KINDS } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.consts'
import { useAttestationKinds } from 'modules/public-reports/hooks/useAttestationKinds.ts'

import type { ReportAttestationsProps } from './ReportAttestations.types'

export const ReportAttestations = ({ report, isLoading, onSelect }: ReportAttestationsProps) => {
  const { t } = useTranslations()
  const { identities, isLoading: isReportLoading } = useAttestationKinds(report.identities)

  const isAnyLoading = isLoading || isReportLoading

  return (
    <Box alignItems="center" display="flex" gap={0.5} height="100%">
      {ATTESTATION_KINDS.map((kind) => {
        const count = identities[kind].length
        const { icon: KindIcon, labelId, titleId } = ATTESTATION_CONFIG[kind]
        const label = t({ id: labelId })
        const title = t({ id: titleId })

        const chip = (
          <Chip
            aria-haspopup="dialog"
            aria-label={t({ id: count ? 'attestationAvailableLabel' : 'attestationPendingLabel' }, { attestation: count > 1 ? `${title} ${count}` : title })}
            color={count ? 'success' : 'default'}
            label={
              <Box alignItems="center" display="flex" gap={0.5}>
                <KindIcon aria-hidden size={14} variant="Outline" />
                {count > 1 ? `${label} ${count}` : label}
              </Box>
            }
            onClick={isAnyLoading ? undefined : () => onSelect(kind)}
          />
        )

        return isAnyLoading ? (
          <Skeleton key={kind} variant="rounded">
            {chip}
          </Skeleton>
        ) : (
          <Tooltip key={kind} title={t({ id: 'viewAttestation' })}>
            {chip}
          </Tooltip>
        )
      })}
    </Box>
  )
}

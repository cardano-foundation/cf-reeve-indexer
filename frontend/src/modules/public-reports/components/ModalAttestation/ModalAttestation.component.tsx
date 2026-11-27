import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CloseCircle, Copy, ExportSquare, TickCircle } from 'iconsax-react'
import { useEffect, useState } from 'react'

import { Modal } from 'features/common'
import { getLegalName, useGLEIFVerification } from 'libs/hooks/useGLEIFVerification'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { EXPLORER_TX_URL } from 'modules/public-events-auditor/utils/explorer.ts'
import { DetailRow } from 'modules/public-reports/components/DetailRow/DetailRow.component.tsx'
import { useAttestationKinds } from 'modules/public-reports/hooks/useAttestationKinds.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload.ts'

import { ATTESTATION_CONFIG, COPY_RESET_DELAY } from './ModalAttestation.consts'
import { ActionButtonStyled, KindIconStyled, ModalContentStyled, MonoValueStyled } from './ModalAttestation.styles'
import type { AttestationCopyButtonProps, AttestationDetailsProps, AttestationExplorerLinkProps, CopyState, ModalAttestationProps } from './ModalAttestation.types'

const AttestationCopyButton = ({ label, value }: AttestationCopyButtonProps) => {
  const { t } = useTranslations()
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(() => {
    if (copyState === 'idle') return

    const timeoutId = window.setTimeout(() => setCopyState('idle'), COPY_RESET_DELAY)

    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  const copyLabel = t({ id: 'copyValue' }, { label })
  const tooltipTitle = copyState === 'copied' ? t({ id: 'copied' }) : copyState === 'failed' ? t({ id: 'copyFailed' }) : copyLabel

  return (
    <Tooltip title={tooltipTitle} disableTouchListener>
      <ActionButtonStyled aria-label={tooltipTitle} onClick={() => void handleCopy()}>
        {copyState === 'copied' ? (
          <TickCircle size={20} variant="Outline" />
        ) : copyState === 'failed' ? (
          <CloseCircle size={20} variant="Outline" />
        ) : (
          <Copy size={20} variant="Outline" />
        )}
      </ActionButtonStyled>
    </Tooltip>
  )
}

const AttestationExplorerLink = ({ value }: AttestationExplorerLinkProps) => {
  const { t } = useTranslations()

  return (
    <Tooltip title={t({ id: 'openInExplorer' })} disableTouchListener>
      <Link
        aria-label={t({ id: 'openInExplorer' })}
        borderRadius="50%"
        color="inherit"
        display="flex"
        href={`${EXPLORER_TX_URL}${encodeURIComponent(value)}`}
        p={0.5}
        rel="noreferrer"
        target="_blank"
      >
        <ExportSquare size={20} variant="Outline" />
      </Link>
    </Tooltip>
  )
}

const AttestationDetails = ({ identity }: AttestationDetailsProps) => {
  const { t } = useTranslations()

  const { data: gleifData, isLoading: isGLEIFLoading } = useGLEIFVerification(identity.lei)

  const attestedBy = [getLegalName(gleifData), gleifData?.legalAddress?.city, gleifData?.legalAddress?.country].filter(Boolean).join(', ')

  return (
    <Stack divider={<Divider />} mt={2} pt={2} spacing={2} sx={{ borderTop: 1, borderColor: 'divider' }}>
      <DetailRow label={t({ id: 'status' })}>
        <Box alignItems="center" display="flex" gap={0.5}>
          {identity.identityVerified ? (
            <>
              <TickCircle aria-hidden color={colors.green[500]} size={20} variant="Bold" />
              <Typography fontWeight={500} variant="body1">
                {t({ id: 'verified' })}
              </Typography>
            </>
          ) : (
            <>
              <CloseCircle aria-hidden size={20} variant="Outline" />
              <Typography fontWeight={500} variant="body1">
                {t({ id: 'notVerified' })}
              </Typography>
            </>
          )}
        </Box>
      </DetailRow>
      {identity.lei && (isGLEIFLoading || attestedBy) && (
        <DetailRow label={t({ id: 'attestedBy' })}>
          <Typography fontWeight={600} variant="body1">
            {isGLEIFLoading ? t({ id: 'verifyingLEI' }) : attestedBy}
          </Typography>
        </DetailRow>
      )}
      {identity.lei && (
        <DetailRow label={t({ id: 'leiCode' })} actions={<AttestationCopyButton label={t({ id: 'leiCode' })} value={identity.lei} />}>
          <MonoValueStyled variant="body2">{identity.lei}</MonoValueStyled>
          <Typography color="text.secondary" variant="body2">
            {t({ id: 'leiCodeDescription' })}
          </Typography>
        </DetailRow>
      )}
      {identity.txHash && (
        <DetailRow
          label={t({ id: 'attestationTxHash' })}
          actions={
            <>
              <AttestationCopyButton label={t({ id: 'attestationTxHash' })} value={identity.txHash} />
              <AttestationExplorerLink value={identity.txHash} />
            </>
          }
        >
          <MonoValueStyled variant="body2">{identity.txHash}</MonoValueStyled>
        </DetailRow>
      )}
      {identity.credentialTxHash && (
        <DetailRow
          label={t({ id: 'credentialTxHash' })}
          actions={
            <>
              <AttestationCopyButton label={t({ id: 'credentialTxHash' })} value={identity.credentialTxHash} />
              <AttestationExplorerLink value={identity.credentialTxHash} />
            </>
          }
        >
          <MonoValueStyled variant="body2">{identity.credentialTxHash}</MonoValueStyled>
        </DetailRow>
      )}
    </Stack>
  )
}

export const ModalAttestation = ({ report, kind, onClose }: ModalAttestationProps) => {
  const { t } = useTranslations()

  const { identities } = useAttestationKinds(report.identities)
  const kindIdentities = identities[kind]

  const { icon: KindIcon, titleId, descriptionId } = ATTESTATION_CONFIG[kind]

  return (
    <Modal maxWidth="sm" onClose={onClose} fullWidth isOpen>
      <Modal.Header subtitle={`${t({ id: report.subType })}, ${getReportPeriod(report.intervalType, report.period, report.year)}`} hasCloseButton>
        {t({ id: 'attestation' })}
      </Modal.Header>
      <ModalContentStyled>
        <Box alignItems="center" display="flex" gap={1.5} mt={2}>
          <KindIconStyled $isAvailable={kindIdentities.length > 0}>
            <KindIcon aria-hidden size={20} variant="Outline" />
          </KindIconStyled>
          <Box display="flex" flexDirection="column">
            <Typography component="h3" variant="subtitle2">
              {t({ id: titleId })}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {kindIdentities.length ? t({ id: descriptionId }) : t({ id: 'attestationPending' })}
            </Typography>
          </Box>
        </Box>
        {kindIdentities.map((identity) => (
          <AttestationDetails key={identity.txHash ?? identity.aid} identity={identity} />
        ))}
      </ModalContentStyled>
    </Modal>
  )
}

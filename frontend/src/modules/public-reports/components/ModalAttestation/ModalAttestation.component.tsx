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
import { verifyColors } from 'libs/ui-kit/theme/colors.ts'
import { EXPLORER_TX_URL } from 'modules/public-events-auditor/utils/explorer.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload.ts'

import { ATTESTATION_CONFIG, ATTESTATION_KINDS, COPY_RESET_DELAY } from './ModalAttestation.consts'
import { ActionButtonStyled, KindIconStyled, ModalContentStyled, MonoValueStyled } from './ModalAttestation.styles'
import type { AttestationCopyButtonProps, AttestationExplorerLinkProps, AttestationRowProps, CopyState, ModalAttestationProps } from './ModalAttestation.types'

const AttestationRow = ({ label, children, actions }: AttestationRowProps) => (
  <Box alignItems="center" display="flex" gap={2} py={2}>
    <Box display="flex" flex="1 1 auto" flexDirection="column" gap={0.5} minWidth={0}>
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      {children}
    </Box>
    {actions && (
      <Box display="flex" flexShrink={0}>
        {actions}
      </Box>
    )}
  </Box>
)

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
    <Tooltip title={tooltipTitle}>
      <ActionButtonStyled aria-label={tooltipTitle} onClick={() => void handleCopy()}>
        {copyState === 'copied' ? <TickCircle size={20} variant="Outline" /> : <Copy size={20} variant="Outline" />}
      </ActionButtonStyled>
    </Tooltip>
  )
}

const AttestationExplorerLink = ({ value }: AttestationExplorerLinkProps) => {
  const { t } = useTranslations()

  return (
    <Tooltip title={t({ id: 'openInExplorer' })}>
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

export const ModalAttestation = ({ report, kind, onClose }: ModalAttestationProps) => {
  const { t } = useTranslations()

  const identity = report.identities?.[ATTESTATION_KINDS.indexOf(kind)]

  const { data: gleifData, isLoading: isGLEIFLoading } = useGLEIFVerification(identity?.lei)

  const { icon: KindIcon, titleId, descriptionId } = ATTESTATION_CONFIG[kind]

  const attestedBy = [getLegalName(gleifData), gleifData?.legalAddress?.city, gleifData?.legalAddress?.country].filter(Boolean).join(', ')

  return (
    <Modal maxWidth="sm" onClose={onClose} fullWidth isOpen>
      <Modal.Header subtitle={`${t({ id: report.subType })}, ${getReportPeriod(report.intervalType, report.period, report.year)}`} hasCloseButton>
        {t({ id: 'attestation' })}
      </Modal.Header>
      <ModalContentStyled>
        <Box alignItems="center" display="flex" gap={1.5} mt={2}>
          <KindIconStyled $isAvailable={Boolean(identity)}>
            <KindIcon aria-hidden size={20} variant="Outline" />
          </KindIconStyled>
          <Box display="flex" flexDirection="column">
            <Typography component="h3" variant="subtitle2">
              {t({ id: titleId })}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {identity ? t({ id: descriptionId }) : t({ id: 'attestationPending' })}
            </Typography>
          </Box>
        </Box>
        {identity && (
          <Stack divider={<Divider />} mt={2} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <AttestationRow label={t({ id: 'status' })}>
              <Box alignItems="center" display="flex" gap={0.5}>
                {identity.identityVerified ? (
                  <>
                    <TickCircle aria-hidden color={verifyColors.blue[600]} size={20} variant="Bold" />
                    <Typography color={verifyColors.blue[600]} fontWeight={500} variant="body1">
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
            </AttestationRow>
            {identity.lei && (isGLEIFLoading || attestedBy) && (
              <AttestationRow label={t({ id: 'attestedBy' })}>
                <Typography fontWeight={600} variant="body1">
                  {isGLEIFLoading ? t({ id: 'verifyingLEI' }) : attestedBy}
                </Typography>
              </AttestationRow>
            )}
            {identity.lei && (
              <AttestationRow label={t({ id: 'leiCode' })} actions={<AttestationCopyButton label={t({ id: 'leiCode' })} value={identity.lei} />}>
                <MonoValueStyled variant="body2">{identity.lei}</MonoValueStyled>
                <Typography color="text.secondary" variant="body2">
                  {t({ id: 'leiCodeDescription' })}
                </Typography>
              </AttestationRow>
            )}
            {identity.txHash && (
              <AttestationRow
                label={t({ id: 'attestationTxHash' })}
                actions={
                  <>
                    <AttestationCopyButton label={t({ id: 'attestationTxHash' })} value={identity.txHash} />
                    <AttestationExplorerLink value={identity.txHash} />
                  </>
                }
              >
                <MonoValueStyled variant="body2">{identity.txHash}</MonoValueStyled>
              </AttestationRow>
            )}
            {identity.credentialTxHash && (
              <AttestationRow
                label={t({ id: 'credentialTxHash' })}
                actions={
                  <>
                    <AttestationCopyButton label={t({ id: 'credentialTxHash' })} value={identity.credentialTxHash} />
                    <AttestationExplorerLink value={identity.credentialTxHash} />
                  </>
                }
              >
                <MonoValueStyled variant="body2">{identity.credentialTxHash}</MonoValueStyled>
              </AttestationRow>
            )}
          </Stack>
        )}
      </ModalContentStyled>
    </Modal>
  )
}

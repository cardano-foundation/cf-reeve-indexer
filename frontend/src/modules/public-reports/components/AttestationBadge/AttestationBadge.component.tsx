import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { ExportSquare } from 'iconsax-react'

import { IconsaxIcon, ICONSAX_NAMES } from 'features/iconsax'
import { IconButton } from 'features/mui/base'
import { LEIResponse } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { verifyColors } from 'libs/ui-kit/theme/colors.ts'
import { useGLEIFVerification } from 'modules/public-reports/hooks/useGLEIFVerification'

interface AttestationBadgeProps {
  attestation?: LEIResponse
}

export const AttestationBadge = ({ attestation }: AttestationBadgeProps) => {
  const theme = useTheme()
  const { t } = useTranslations()

  const { data: gleifData, isLoading: isLoadingGLEIF } = useGLEIFVerification(attestation?.lei)

  const getLegalName = () => {
    if (!gleifData?.legalName) return null
    if (typeof gleifData.legalName === 'string') return gleifData.legalName
    return gleifData.legalName.name || null
  }

  const legalName = getLegalName()

  const color = attestation ? verifyColors.blue[600] : theme.palette.grey[400]

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error)
    }
  }

  const renderTxRow = (labelId: string, txHash: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
        {t({ id: labelId })}:
      </Typography>
      <Box alignItems="center" display="flex" gap={1}>
        <Tooltip
          title={txHash}
          disableInteractive={false}
          slotProps={{
            tooltip: {
              sx: {
                userSelect: 'text'
              }
            }
          }}
        >
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: theme.palette.common.white
            }}
          >
            {`${txHash.slice(0, 4)}...${txHash.slice(-4)}`}
          </Typography>
        </Tooltip>
        <Link display="flex" href={`https://explorer.cardano.org/transaction/${txHash}`} rel="noreferrer" target="_blank">
          <ExportSquare color={theme.palette.action.active} size={16} variant="Outline" />
        </Link>
        <IconButton aria-label={t({ id: 'copyTransactionHash' })} onClick={() => handleCopy(txHash)} size="small">
          <IconsaxIcon name={ICONSAX_NAMES.COPY} size={16} variant="Outline" color={theme.palette.action.active} />
        </IconButton>
      </Box>
    </Box>
  )

  const tooltipContent = (
    <Box sx={{ p: 1.5, minWidth: 280 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.common.white }}>
        {t({ id: 'attestation' })}
      </Typography>
      {attestation ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {attestation.lei &&
            (isLoadingGLEIF ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                  {t({ id: 'verifyingLEI' })}
                </Typography>
              </Box>
            ) : (
              legalName && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <IconsaxIcon name={ICONSAX_NAMES.TICK_CIRCLE} size={16} variant="Bold" color={verifyColors.blue[600]} />
                  <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
                    {legalName}
                    {gleifData?.legalAddress?.city && gleifData?.legalAddress?.country && `, ${gleifData.legalAddress.city}, ${gleifData.legalAddress.country}`}
                  </Typography>
                </Box>
              )
            ))}
          <Typography variant="body2" sx={{ color: '#85C8FF', fontWeight: 600 }}>
            {t({ id: 'verified' })}
          </Typography>
          {attestation.lei && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                {t({ id: 'leiCode' })}:{' '}
                <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace', color: theme.palette.common.white }}>
                  {attestation.lei}
                </Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t({ id: 'leiCodeGloss' })}
              </Typography>
            </Box>
          )}
          {attestation.txHash && renderTxRow('attestationTxHash', attestation.txHash)}
          {attestation.credentialTxHash && renderTxRow('credentialTxHash', attestation.credentialTxHash)}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
          {t({ id: 'attestationPending' })}
        </Typography>
      )}
    </Box>
  )

  return (
    <Tooltip
      title={tooltipContent}
      placement="top"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: theme.palette.grey[800],
            color: theme.palette.common.white,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            borderRadius: 2,
            '& .MuiTooltip-arrow': {
              color: theme.palette.grey[800]
            }
          }
        }
      }}
    >
      <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
        <IconsaxIcon name={ICONSAX_NAMES.AWARD} size={22} variant="Outline" color={color} />
      </Box>
    </Tooltip>
  )
}

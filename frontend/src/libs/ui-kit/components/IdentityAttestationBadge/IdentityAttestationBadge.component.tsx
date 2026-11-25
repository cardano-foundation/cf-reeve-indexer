import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { ExportSquare } from 'iconsax-react'

import { IconsaxIcon, ICONSAX_NAMES } from 'features/iconsax'
import { useGLEIFVerification } from 'libs/hooks/useGLEIFVerification'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { describeClaims } from 'libs/ui-kit/components/IdentityAttestationBadge/credentialClaims'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { verifyColors } from 'libs/ui-kit/theme/colors.ts'

interface IdentityAttestationBadgeProps {
  isVerified: boolean
  schemaName?: string
  schemaSaid?: string
  claims?: Record<string, unknown> | null
  lei?: string | null
  txHash?: string
  credentialTxHash?: string
}

/**
 * Generic, schema-aware verified-identity badge. Reused for both reports and documents: the
 * primary label is the credential's schema name (falling back to its SAID, then a generic label),
 * never a hardcoded "LEI". The GLEIF cross-check only runs, and only renders, when a `lei` is
 * present - i.e. the vLEI schema. Any other schema's attributes surface via the generic `claims`
 * map instead.
 */
export const IdentityAttestationBadge = ({
  isVerified,
  schemaName,
  schemaSaid,
  claims,
  lei,
  txHash,
  credentialTxHash
}: IdentityAttestationBadgeProps) => {
  const theme = useTheme()
  const { t } = useTranslations()

  const { data: gleifData, isLoading: isLoadingGLEIF } = useGLEIFVerification(lei)
  const leiKnownToGLEIF = !!gleifData
  const color = isVerified ? verifyColors.blue[600] : theme.palette.grey[400]

  const primaryLabel = schemaName || schemaSaid || t({ id: 'verifiedCredential' })

  // Extract legal name - handle both string and object format
  const getLegalName = () => {
    if (!gleifData?.legalName) return null
    if (typeof gleifData.legalName === 'string') return gleifData.legalName
    return gleifData.legalName.name || null
  }

  const legalName = getLegalName()
  // Labelled and ordered per credential type rather than dumped in serialisation order — a Foundation
  // Employee shows Name / Role, not firstName / engagementContextRole. See describeClaims.
  const claimRows = describeClaims(claims)

  const tooltipContent = (
    <Box sx={{ p: 1.5, minWidth: 280 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.common.white }}>
        {primaryLabel}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
            {t({ id: 'status' })}:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isVerified ? '#85C8FF' : '#FFA19E',
              fontWeight: 600
            }}
          >
            {isVerified ? t({ id: 'verified' }) : t({ id: 'notVerified' })}
          </Typography>
        </Box>

        {/* GLEIF cross-check is only ever shown for the vLEI schema (a truthy `lei`). Every other
            schema's attributes surface generically via `claims` instead. */}
        {lei ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                LEI:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: theme.palette.common.white
                }}
              >
                {lei}
              </Typography>
            </Box>
            {isLoadingGLEIF ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                  {t({ id: 'verifyingLEI' })}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t({ id: 'leiRegistered' })}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: leiKnownToGLEIF ? '#85C8FF' : '#FFA19E',
                      fontWeight: 600
                    }}
                  >
                    {leiKnownToGLEIF ? t({ id: 'yes' }) : t({ id: 'no' })}
                  </Typography>
                </Box>
                {gleifData && legalName && (
                  <Box
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}
                    >
                      {t({ id: 'legalEntity' })}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.common.white,
                        fontWeight: 600,
                        mt: 0.5
                      }}
                    >
                      {legalName}
                    </Typography>
                    {gleifData.legalAddress && (
                      <Box sx={{ mt: 0.5 }}>
                        {gleifData.legalAddress.city && gleifData.legalAddress.country && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)'
                            }}
                          >
                            {gleifData.legalAddress.city}, {gleifData.legalAddress.country}
                          </Typography>
                        )}
                      </Box>
                    )}
                    {gleifData.entityStatus && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: gleifData.entityStatus === 'ACTIVE' ? '#85C8FF' : 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500
                          }}
                        >
                          {t({ id: 'status' })}: {gleifData.entityStatus}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </>
        ) : claimRows.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
            >
              {t({ id: 'claims' })}
            </Typography>
            {claimRows.map((claim) => (
              <Box key={claim.key} sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                  {claim.label}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.common.white,
                    wordBreak: 'break-word',
                    ...(claim.mono ? { fontFamily: 'monospace', fontSize: '0.85rem' } : {})
                  }}
                >
                  {claim.value}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontStyle: 'italic'
            }}
          >
            {t({ id: 'noAdditionalClaims' })}
          </Typography>
        )}

        {txHash && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
              {t({ id: 'attestationTxHash' })}:
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
            </Box>
          </Box>
        )}
        {credentialTxHash && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
              {t({ id: 'credentialTxHash' })}:
            </Typography>
            <Box alignItems="center" display="flex" gap={1}>
              <Tooltip
                title={credentialTxHash}
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
                  {`${credentialTxHash.slice(0, 4)}...${credentialTxHash.slice(-4)}`}
                </Typography>
              </Tooltip>
              <Link display="flex" href={`https://explorer.cardano.org/transaction/${credentialTxHash}`} rel="noreferrer" target="_blank">
                <ExportSquare color={theme.palette.action.active} size={16} variant="Outline" />
              </Link>
            </Box>
          </Box>
        )}
      </Box>
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
      <Box aria-label={primaryLabel} display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
        <IconsaxIcon name={ICONSAX_NAMES.VERIFY} size={22} variant="Outline" color={color} />
      </Box>
    </Tooltip>
  )
}

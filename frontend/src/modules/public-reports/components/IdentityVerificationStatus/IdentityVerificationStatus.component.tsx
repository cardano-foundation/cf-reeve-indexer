import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { IconsaxIcon, ICONSAX_NAMES } from 'features/iconsax'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { verifyColors } from 'libs/ui-kit/theme/colors.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useGLEIFVerification } from 'modules/public-reports/hooks/useGLEIFVerification'

interface IdentityVerificationStatusProps {
  isVerified: boolean
  lei?: string
}

export const IdentityVerificationStatus = ({ isVerified, lei }: IdentityVerificationStatusProps) => {
  const theme = useTheme()
  const { t } = useTranslations()
  
  const { data: gleifData, isLoading: isLoadingGLEIF } = useGLEIFVerification(lei)
  const leiKnownToGLEIF = !!gleifData
  const color = isVerified ? verifyColors.blue[600] : theme.palette.grey[400]
  
  // Extract legal name - handle both string and object format
  const getLegalName = () => {
    if (!gleifData?.legalName) return null
    if (typeof gleifData.legalName === 'string') return gleifData.legalName
    return gleifData.legalName.name || null
  }
  
  const legalName = getLegalName()
  
  const tooltipContent = (
    <Box sx={{ p: 1.5, minWidth: 280 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.common.white }}>
        {t({ id: 'identityVerification' })}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
            {t({ id: 'status' })}:
          </Typography>
          <Typography variant="body2" sx={{ 
            color: isVerified ? '#85C8FF' : '#FFA19E',
            fontWeight: 600 
          }}>
            {isVerified ? t({ id: 'verified' }) : t({ id: 'notVerified' })}
          </Typography>
        </Box>
        {lei && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                LEI:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.85rem',
                color: theme.palette.common.white
              }}>
                {lei}
              </Typography>
            </Box>
            {isLoadingGLEIF ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={14} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                  {t({ id: 'verifyingWithGLEIF' })}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                    {t({ id: 'gleifVerified' })}:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: leiKnownToGLEIF ? '#85C8FF' : '#FFA19E',
                    fontWeight: 600
                  }}>
                    {leiKnownToGLEIF ? t({ id: 'yes' }) : t({ id: 'no' })}
                  </Typography>
                </Box>
                {gleifData && legalName && (
                  <>
                    <Box sx={{ 
                      mt: 1, 
                      pt: 1, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255, 255, 255, 0.5)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}>
                        {t({ id: 'legalEntity' })}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.common.white,
                        fontWeight: 600,
                        mt: 0.5
                      }}>
                        {legalName}
                      </Typography>
                      {gleifData.legalAddress && (
                        <Box sx={{ mt: 0.5 }}>
                          {gleifData.legalAddress.city && gleifData.legalAddress.country && (
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)' 
                            }}>
                              {gleifData.legalAddress.city}, {gleifData.legalAddress.country}
                            </Typography>
                          )}
                        </Box>
                      )}
                      {gleifData.entityStatus && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ 
                            color: gleifData.entityStatus === 'ACTIVE' ? '#85C8FF' : 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500
                          }}>
                            {t({ id: 'status' })}: {gleifData.entityStatus}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </>
            )}
          </>
        )}
        {!lei && (
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.5)', 
            fontStyle: 'italic' 
          }}>
            {t({ id: 'noLeiProvided' })}
          </Typography>
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
              color: theme.palette.grey[800],
            },
          },
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
        <IconsaxIcon
          name={ICONSAX_NAMES.VERIFY}
          size={22}
          variant="Outline"
          color={color}
        />
      </Box>
    </Tooltip>
  )
}

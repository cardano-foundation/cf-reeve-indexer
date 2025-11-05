import { Grid, Typography, Box } from 'features/mui/base'
import { useTheme } from '@mui/material'
import { keyframes } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { Refresh } from 'iconsax-react'
import { Logo } from 'assets/images'
import { ContractResponse } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi.types'
import { caslChartColors } from 'libs/ui-kit/theme/colors'
import { snakeCaseToTitleCase, mapValuesToNumbers } from 'modules/public-reward-dashboard/utils/formatUtils'

interface DatumCardProps {
  data?: ContractResponse
  isLoading: boolean
}

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

export const DatumCard = ({ data, isLoading }: DatumCardProps) => {
  const theme = useTheme()

  if (isLoading) {
    return (
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${caslChartColors.cyan[600]} 100%)`,
          borderRadius: 3,
          padding: 3,
          color: 'white',
          textAlign: 'center',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <CircularProgress sx={{ color: 'white', mb: 2 }} size={48} />
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Loading latest data...
        </Typography>
      </Box>
    )
  }

  if (!data || !data.datum_data) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: 3,
          padding: 3,
          color: theme.palette.text.secondary,
          textAlign: 'center',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.primary }}>
          No Data Available
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          No data points found for this asset.
        </Typography>
      </Box>
    )
  }

  const datumValues = mapValuesToNumbers(data.datum_data)

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${caslChartColors.cyan[600]} 100%)`,
        borderRadius: 3,
        padding: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${caslChartColors.cyan[600]}, transparent)`,
          animation: `${shimmer} 2s infinite`
        }
      }}>
       <Box
  sx={{
    position: 'absolute',
    top: 0,
    right: 0,
    width: 350,
    height: 250,
    opacity: 0.15,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    userSelect: 'none',
    '&:hover': {
      opacity: 0.25,
      transform: 'scale(1.05)',
    },
  }}
>
  <img
    src={Logo}
    alt="Cardano logo"
    style={{
      width: '350px',
      height: '250px',
      objectFit: 'cover',
      display: 'block',
    }}
  />
</Box>
 
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5,
          pb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Refresh size={28} variant="Bold" />
          Latest Data Point
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
          {new Date(data.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(datumValues).map(([key, value], index) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                '@keyframes fadeIn': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(10px)'
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}>
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500, textTransform: 'capitalize' }}>
                {snakeCaseToTitleCase(key)}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 10
                })}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import { DocumentText } from 'iconsax-react'

import { ContractResponse } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi.types'
import { chartColors } from 'libs/ui-kit/theme/colors'
import { snakeCaseToTitleCase, mapValuesToNumbers } from 'modules/public-data-explorer-asset-overview/utils/formatUtils'

interface RedeemerTableProps {
  data?: ContractResponse
  isLoading: boolean
}

export const RedeemerTable = ({ data, isLoading }: RedeemerTableProps) => {
  const theme = useTheme()

  if (isLoading) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          borderRadius: 3,
          padding: 6,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
        }}
      >
        <CircularProgress sx={{ mb: 2 }} size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading redeemer data...
        </Typography>
      </Box>
    )
  }

  if (!data || !data.redeemer_data || Object.keys(data.redeemer_data).length === 0) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          borderRadius: 3,
          padding: 6,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DocumentText size={48} variant="Bold" color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
        <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.primary }}>
          No Redeemer Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There is currently no redeemer data for this asset.
        </Typography>
      </Box>
    )
  }

  const redeemerValues = mapValuesToNumbers(data.redeemer_data)

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        borderRadius: 2,
        padding: 2.5,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DocumentText size={28} variant="Bold" color={theme.palette.primary.main} />
          Redeemer Data
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Timestamp: {new Date(data.timestamp).toLocaleString()}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: `linear-gradient(135deg, ${chartColors.blue[700]} 0%, ${chartColors.cyan[800]} 100%)`,
              }}
            >
              <TableCell
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: 2,
                }}
              >
                Field
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: 2,
                }}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(redeemerValues).map(([key, value], index) => (
              <TableRow
                key={key}
                sx={{
                  backgroundColor: theme.palette.background.default,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                  '@keyframes fadeIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateX(-10px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: 1.75,
                  }}
                >
                  {snakeCaseToTitleCase(key)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: chartColors.blue[700],
                    fontWeight: 600,
                    fontFamily: 'Courier New, monospace',
                    fontSize: '1.1rem',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    padding: 1.75,
                  }}
                >
                  {value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

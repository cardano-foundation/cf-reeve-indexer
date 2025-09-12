import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'

import { ReconciliationFilter } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReconciledTransactionsModel } from 'libs/models/reconciliation-model/GetReconciledTransactions/GetReconciledTransactions.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors'

const sumObjectValues = (obj: { [key: string]: number }): number => {
  return Object.values(obj).reduce((sum, value) => sum + value, 0)
}

interface ChartTransactionsUnreconciledProps {
  hasBeenReconciled: boolean
}

export const ChartTransactionsUnreconciled = ({ hasBeenReconciled }: ChartTransactionsUnreconciledProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const selectedOrganisation = useSelectedOrganisation()

  const { reconciledTransactions } = useGetReconciledTransactionsModel({
    organisationId: selectedOrganisation,
    filter: ReconciliationFilter.UNRECONCILED
  })

  const transactionsUnreconciledData = {
    missingInERP: reconciledTransactions?.statistic.missingInERP ?? 0,
    inProcessing: reconciledTransactions?.statistic.inProcessing ?? 0,
    newInERP: reconciledTransactions?.statistic.newInERP ?? 0,
    newVersionNotPublished: reconciledTransactions?.statistic.newVersionNotPublished ?? 0,
    newVersion: reconciledTransactions?.statistic.newVersion ?? 0
  }

  const transactionsUnreconciledAmountTotal = reconciledTransactions?.statistic.nok
  const chartMaxValue = sumObjectValues(transactionsUnreconciledData)

  return (
    <Box p={3} bgcolor={theme.palette.common.white} borderRadius="8px" border={`1px solid ${theme.palette.divider}`} boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.1)'}>
      {hasBeenReconciled && (
        <>
          <Box
            sx={(theme) => ({
              background: paletteColors.neutral[200],
              borderRadius: theme.shape.borderRadius * 0.375,
              overflow: 'hidden'
            })}
          >
            <BarChart
              axisHighlight={{
                x: 'none',
                y: 'none'
              }}
              borderRadius={8}
              colors={[
                paletteColors.orange[500] as string,
                paletteColors.orange[600] as string,
                paletteColors.orange[700] as string,
                paletteColors.orange[800] as string,
                paletteColors.orange[900] as string
              ]}
              dataset={[transactionsUnreconciledData]}
              height={28}
              layout="horizontal"
              margin={{ top: -4, right: 0, bottom: -4, left: -4 }}
              series={[
                {
                  dataKey: 'missingInERP',
                  label: t({ id: 'MISSING_IN_ERP' }),
                  labelMarkType: 'circle',
                  stack: 'unreconciled'
                },
                {
                  dataKey: 'inProcessing',
                  label: t({ id: 'IN_PROCESSING' }),
                  labelMarkType: 'circle',
                  stack: 'unreconciled'
                },
                {
                  dataKey: 'newInERP',
                  label: t({ id: 'NEW_IN_ERP' }),
                  labelMarkType: 'circle',
                  stack: 'unreconciled'
                },
                {
                  dataKey: 'newVersionNotPublished',
                  label: t({ id: 'NEW_VERSION_NOT_PUBLISHED' }),
                  labelMarkType: 'circle',
                  stack: 'unreconciled'
                },
                {
                  dataKey: 'newVersion',
                  label: t({ id: 'NEW_VERSION' }),
                  labelMarkType: 'circle',
                  stack: 'unreconciled'
                }
              ]}
              slotProps={{
                bar: { height: 28 },
                tooltip: {
                  sx: (theme) => ({
                    '& .MuiChartsTooltip-paper': {
                      background: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: `${theme.shape.borderRadius * 2}px`,
                      boxShadow: '0 4px 16px -1px rgba(0, 0, 0, 0.1)'
                    },
                    '& .MuiChartsTooltip-mark': {
                      width: '6px',
                      height: '6px'
                    },
                    '& .MuiChartsTooltip-labelCell': {
                      padding: theme.spacing(0, 0, 0, 1.5),
                      verticalAlign: 'middle'
                    },
                    '& .MuiChartsTooltip-valueCell': {
                      textAlign: 'right',
                      verticalAlign: 'middle'
                    }
                  }),
                  trigger: 'item'
                }
              }}
              xAxis={[{ data: [], max: chartMaxValue, position: 'none' }]}
              yAxis={[{ data: [''], scaleType: 'band', position: 'none' }]}
              hideLegend
            />
          </Box>
          <Box pt={1.5} display={'flex'}>
            <Typography variant="body1" color={theme.palette.text.primary}>
              {`${transactionsUnreconciledAmountTotal}`}&nbsp;
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              {t({ id: 'transactionsUnreconciled' })}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
}

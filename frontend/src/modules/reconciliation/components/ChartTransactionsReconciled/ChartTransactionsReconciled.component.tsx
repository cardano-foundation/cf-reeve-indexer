import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'

import { ReconciliationFilter } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReconciledTransactionsModel } from 'libs/models/reconciliation-model/GetReconciledTransactions/GetReconciledTransactions.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors'

export const ChartTransactionsReconciled = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const selectedOrganisation = useSelectedOrganisation()

  const { reconciledTransactions } = useGetReconciledTransactionsModel({
    organisationId: selectedOrganisation,
    filter: ReconciliationFilter.RECONCILED
  })

  const transactionsReconciledAmount = reconciledTransactions?.statistic.ok
  const transactionsTotalAmount = reconciledTransactions?.statistic.total
  const transactionsReconciledPercentage =
    transactionsReconciledAmount && transactionsTotalAmount ? Number(((transactionsReconciledAmount / transactionsTotalAmount) * 100).toFixed(2)) : 0

  const datasetReconciled = {
    reconciled: transactionsReconciledPercentage
  }

  return (
    <Box p={3} bgcolor={theme.palette.common.white} borderRadius="8px" border={`1px solid ${theme.palette.divider}`} boxShadow={'0px 1px 2px 0px rgba(0, 0, 0, 0.1)'}>
      {reconciledTransactions && (
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
            colors={[paletteColors.green[600] as string]}
            dataset={[datasetReconciled]}
            height={28}
            layout="horizontal"
            margin={{ top: -4, right: 0, bottom: -4, left: -4 }}
            series={[{ dataKey: 'reconciled' }]}
            slotProps={{
              tooltip: { trigger: 'none' }
            }}
            xAxis={[{ data: [], max: 100, position: 'none' }]}
            yAxis={[{ data: [''], scaleType: 'band', position: 'none' }]}
            hideLegend
          />
        </Box>
      )}
      <Box pt={1.5} display={'flex'}>
        <Typography variant="body1" color={theme.palette.text.primary}>
          {`${transactionsReconciledPercentage}%`}&nbsp;
        </Typography>
        <Typography variant="body1" color={theme.palette.text.secondary}>
          {t({ id: 'transactionsReconciled' })}
        </Typography>
      </Box>
    </Box>
  )
}

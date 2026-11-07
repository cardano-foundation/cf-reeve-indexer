import Typography from '@mui/material/Typography'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'
import { mockTransactionsOverview } from 'modules/public-transactions/utils/mockTransactions.ts'

import { OverviewItemStyled, OverviewStyled } from './TransactionsOverview.styles'

const formatCount = (value: number) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const TransactionsOverview = () => {
  const { t } = useTranslations()
  const { periodFrom, periodTo, transactionsCount, itemsCount, lastUpdated } = mockTransactionsOverview

  const items = [
    {
      label: t({ id: 'publicTransactionsOverviewPeriod' }),
      value: t({ id: 'publicTransactionsOverviewPeriodRange' }, { from: formatAuditDate(periodFrom), to: formatAuditDate(periodTo) })
    },
    { label: t({ id: 'publicTransactionsOverviewTransactions' }), value: formatCount(transactionsCount) },
    { label: t({ id: 'publicTransactionsOverviewItems' }), value: formatCount(itemsCount) },
    { label: t({ id: 'publicTransactionsOverviewLastUpdated' }), value: formatAuditDate(lastUpdated) }
  ]

  return (
    <OverviewStyled component="dl">
      {items.map(({ label, value }) => (
        <OverviewItemStyled key={label}>
          <Typography component="dt" color="text.secondary" variant="caption">
            {label}
          </Typography>
          <Typography component="dd" variant="subtitle1" fontWeight={600}>
            {value}
          </Typography>
        </OverviewItemStyled>
      ))}
    </OverviewStyled>
  )
}

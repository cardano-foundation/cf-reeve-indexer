import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useGetOrganisationTransactionsOverviewModel } from 'libs/models/organisation-model/GetOrganisationTransactionsOverview/GetOrganisationTransactionsOverview.service'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'

import { OverviewItemStyled, OverviewStyled } from './TransactionsOverview.styles'

const formatCount = (value: number | undefined) => (value === undefined ? '-' : formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 }))

const formatPeriodStart = (period: string) => formatAuditDate(`${period}-01`)

const formatPeriodEnd = (period: string) => formatAuditDate(dayjs(`${period}-01`).endOf('month').format('YYYY-MM-DD'))

export const TransactionsOverview = () => {
  const { t } = useTranslations()
  const { selectedOrganisation } = useLayoutPublicContext()
  const { transactionsOverview, isTransactionsOverviewFetching } = useGetOrganisationTransactionsOverviewModel(
    { parameters: { organisationId: selectedOrganisation } },
    Boolean(selectedOrganisation)
  )
  const isLoading = !transactionsOverview && (isTransactionsOverviewFetching || !selectedOrganisation)
  const { periodFrom, periodTo, transactionsCount, itemsCount, lastUpdated } = transactionsOverview ?? {}

  const items = [
    {
      label: t({ id: 'publicTransactionsOverviewPeriod' }),
      value: periodFrom && periodTo ? t({ id: 'publicTransactionsOverviewPeriodRange' }, { from: formatPeriodStart(periodFrom), to: formatPeriodEnd(periodTo) }) : '-'
    },
    { label: t({ id: 'publicTransactionsOverviewTransactions' }), value: formatCount(transactionsCount) },
    { label: t({ id: 'publicTransactionsOverviewItems' }), value: formatCount(itemsCount) },
    { label: t({ id: 'publicTransactionsOverviewLastUpdated' }), value: formatAuditDate(lastUpdated ? dayjs.unix(lastUpdated).format('YYYY-MM-DD') : null) }
  ]

  return (
    <OverviewStyled component="dl" aria-busy={isLoading}>
      {items.map(({ label, value }) => (
        <OverviewItemStyled key={label}>
          <Typography component="dt" color="text.secondary" variant="caption">
            {label}
          </Typography>
          <Typography component="dd" variant="subtitle1" fontWeight={600}>
            {isLoading ? <Skeleton variant="text" width="60%" /> : value}
          </Typography>
        </OverviewItemStyled>
      ))}
    </OverviewStyled>
  )
}

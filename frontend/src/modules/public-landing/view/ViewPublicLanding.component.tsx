import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ArrowRight2, ArrowSwapHorizontal, Buildings, DocumentText, MoneyRecive, ShieldTick } from 'iconsax-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'
import { useGetDashboardOverviewModel } from 'libs/models/overview-model/GetDashboardOverview/GetDashboardOverviewModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Button } from 'libs/ui-kit/components/Button/Button.component.tsx'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'
import { BreakdownBars } from 'modules/public-landing/components/BreakdownBars.component.tsx'
import { DashboardCard } from 'modules/public-landing/components/DashboardCard.component.tsx'
import { FundingFlow } from 'modules/public-landing/components/FundingFlow.component.tsx'
import { RecentList } from 'modules/public-landing/components/RecentList.component.tsx'
import { StatTile } from 'modules/public-landing/components/StatTile.component.tsx'
import { TransactionActivity } from 'modules/public-landing/components/TransactionActivity.component.tsx'
import { formatCount, formatDate, formatReportPeriod, humanize, shortHash } from 'modules/public-landing/utils/dashboard.ts'
import { getOrgPath, PATHS } from 'routes'

const ALL_ORGANISATIONS = 'ALL'

type Section = 'reports' | 'transactions' | 'projects'

export const ViewPublicLanding = () => {
  const { t } = useTranslations()
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext()
  const { organisations } = useGetOrganisationsModel()

  const [scope, setScope] = useState<string>(selectedOrganisation || ALL_ORGANISATIONS)
  const organisationId = scope === ALL_ORGANISATIONS ? undefined : scope

  const { overview, isOverviewFetching } = useGetDashboardOverviewModel(organisationId)
  const isLoading = isOverviewFetching && !overview

  // Deep links (?organisation_id=...) keep landing straight on that organisation's reports.
  useEffect(() => {
    const orgId = searchParams.get('organisation_id')
    if (orgId && organisations && organisations.length > 0) {
      const organisationExists = organisations.some((o) => o.id === orgId)
      if (organisationExists) {
        setSelectedOrganisation(orgId)
        navigate(PATHS.PUBLIC_REPORTS, { replace: true })
      }
    }
  }, [searchParams, organisations, setSelectedOrganisation, navigate])

  const handleScopeChange = (value: string) => {
    setScope(value)
    if (value !== ALL_ORGANISATIONS) setSelectedOrganisation(value)
  }

  const goTo = (section: Section, orgId?: string) => {
    const target = orgId ?? organisationId
    if (!target) return
    setSelectedOrganisation(target)
    navigate(getOrgPath(section, target))
  }

  // Section pages are organisation-scoped, so "view all" only makes sense once one is picked.
  const sectionLink = (section: Section) =>
    organisationId ? (
      <Button endIcon={<ArrowRight2 size={16} />} size="small" variant="text" onClick={() => goTo(section)}>
        {t({ id: 'dashboardViewAll' })}
      </Button>
    ) : undefined

  const transactions = overview?.transactions
  const reports = overview?.reports
  const funding = overview?.funding

  const scopeName = organisationId ? organisations?.find((o) => o.id === organisationId)?.name : t({ id: 'dashboardAllOrganisations' })
  const iconColor = theme.palette.text.primary

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'dashboardSubtitle' })} title={t({ id: 'reeveIndexer' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={3} hasMinContentHeight>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'flex-end' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography color="text.primary" component="h1" variant="h2">
              {scopeName}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {transactions?.firstDate && transactions?.lastDate
                ? t({ id: 'dashboardCoverage' }, { from: formatDate(transactions.firstDate), to: formatDate(transactions.lastDate) })
                : t({ id: 'dashboardIntro' })}
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label={t({ id: 'dashboardScope' })}
            value={scope}
            onChange={(event) => handleScopeChange(event.target.value)}
            sx={{ minWidth: { sm: 280 } }}
          >
            <MenuItem value={ALL_ORGANISATIONS}>{t({ id: 'dashboardAllOrganisations' })}</MenuItem>
            {(organisations ?? []).map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, lg: 3 }}>
            <StatTile
              label={t({ id: 'dashboardTransactions' })}
              value={formatCount(transactions?.total)}
              hint={t({ id: 'dashboardTransactionsHint' }, { items: formatCount(transactions?.itemCount), batches: formatCount(transactions?.batchCount) })}
              icon={<ArrowSwapHorizontal size={20} color={iconColor} />}
              isLoading={isLoading}
              onClick={organisationId ? () => goTo('transactions') : undefined}
            />
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <StatTile
              label={t({ id: 'dashboardReports' })}
              value={formatCount(reports?.total)}
              hint={t({ id: 'dashboardReportsHint' }, { verified: formatCount(reports?.verified), publications: formatCount(reports?.publications) })}
              icon={<DocumentText size={20} color={iconColor} />}
              isLoading={isLoading}
              onClick={organisationId ? () => goTo('reports') : undefined}
            />
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <StatTile
              label={t({ id: 'dashboardFundingEvents' })}
              value={formatCount(funding?.eventCount)}
              hint={t({ id: 'dashboardFundingHint' }, { projects: formatCount(funding?.projectCount), rounds: formatCount(funding?.fundingRoundCount) })}
              icon={<MoneyRecive size={20} color={iconColor} />}
              isLoading={isLoading}
              onClick={organisationId ? () => goTo('projects') : undefined}
            />
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <StatTile
              label={t({ id: 'dashboardOrganisations' })}
              value={formatCount(overview?.organisationCount)}
              hint={t({ id: 'dashboardOrganisationsHint' })}
              icon={<Buildings size={20} color={iconColor} />}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardCard
              title={t({ id: 'dashboardFundingFlow' })}
              description={t({ id: 'dashboardFundingFlowDescription' })}
              icon={<MoneyRecive size={20} color={iconColor} />}
              action={sectionLink('projects')}
            >
              {funding && <FundingFlow funding={funding} />}
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardCard title={t({ id: 'dashboardLatestFunding' })} description={t({ id: 'dashboardLatestFundingDescription' })}>
              <BreakdownBars title={t({ id: 'dashboardByEventType' })} items={funding?.byType ?? []} limit={4} />
              <RecentList
                emptyMessage={t({ id: 'dashboardNothingYet' })}
                rows={(funding?.recent ?? []).map((event) => ({
                  key: event.id,
                  primary: `${humanize(event.eventType)} · ${event.eventId}`,
                  secondary: [event.counterparty, organisationId ? null : event.organisationName, formatDate(event.date)].filter(Boolean).join(' · '),
                  trailing: event.totalAmount != null ? formatAuditAmount(event.totalAmount, event.currency, true) : undefined,
                  onClick: () => goTo('projects', event.organisationId)
                }))}
              />
            </DashboardCard>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <DashboardCard
              title={t({ id: 'dashboardTransactions' })}
              description={t({ id: 'dashboardTransactionsDescription' })}
              icon={<ArrowSwapHorizontal size={20} color={iconColor} />}
              action={sectionLink('transactions')}
            >
              <TransactionActivity monthly={transactions?.monthly ?? []} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <BreakdownBars title={t({ id: 'dashboardByType' })} items={transactions?.byType ?? []} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
                    {t({ id: 'dashboardLatestTransactions' })}
                  </Typography>
                  <RecentList
                    emptyMessage={t({ id: 'dashboardNothingYet' })}
                    rows={(transactions?.recent ?? []).slice(0, 4).map((tx) => ({
                      key: tx.id,
                      primary: tx.internalNumber,
                      secondary: [humanize(tx.type), organisationId ? null : tx.organisationName, shortHash(tx.txHash)].filter(Boolean).join(' · '),
                      trailing: formatDate(tx.date),
                      trailingHint: t({ id: 'dashboardItemsCount' }, { count: tx.itemCount }),
                      onClick: () => goTo('transactions', tx.organisationId)
                    }))}
                  />
                </Grid>
              </Grid>
              {/* Project / counterparty codes are optional on transaction items; skip the row when nobody publishes them. */}
              {Boolean(transactions?.projectCount || transactions?.counterpartyCount) && (
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
                  <MiniStat label={t({ id: 'dashboardProjectsReferenced' })} value={formatCount(transactions?.projectCount)} />
                  <MiniStat label={t({ id: 'dashboardCounterparties' })} value={formatCount(transactions?.counterpartyCount)} />
                </Box>
              )}
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <DashboardCard
              title={t({ id: 'dashboardReports' })}
              description={t({ id: 'dashboardReportsDescription' })}
              icon={<DocumentText size={20} color={iconColor} />}
              action={sectionLink('reports')}
            >
              <VerifiedShare verified={reports?.verified ?? 0} total={reports?.publications ?? 0} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <BreakdownBars title={t({ id: 'dashboardByReportType' })} items={reports?.bySubType ?? []} limit={4} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <BreakdownBars title={t({ id: 'dashboardByInterval' })} items={reports?.byInterval ?? []} limit={3} />
                </Grid>
              </Grid>
              <Box>
                <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em">
                  {t({ id: 'dashboardLatestReports' })}
                </Typography>
                <RecentList
                  emptyMessage={t({ id: 'dashboardNothingYet' })}
                  rows={(reports?.recent ?? []).slice(0, 4).map((report) => ({
                    key: report.id,
                    primary: humanize(report.subType),
                    secondary: [
                      formatReportPeriod(report.interval, report.year, report.period),
                      organisationId ? null : report.organisationName,
                      report.ver != null ? `v${report.ver}` : null
                    ]
                      .filter(Boolean)
                      .join(' · '),
                    trailing: report.identityVerified ? <Chip color="success" icon={<ShieldTick size={14} />} label={t({ id: 'dashboardVerified' })} /> : undefined,
                    onClick: () => goTo('reports', report.organisationId)
                  }))}
                />
              </Box>
            </DashboardCard>
          </Grid>
        </Grid>
      </LayoutPublic.Main>
    </>
  )
}

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography color="text.secondary" variant="caption">
      {label}
    </Typography>
    <Typography color="text.primary" variant="h3" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Box>
)

const VerifiedShare = ({ verified, total }: { verified: number; total: number }) => {
  const { t } = useTranslations()
  const theme = useTheme()

  const share = total > 0 ? verified / total : 0

  return (
    <Box display="flex" alignItems="center" gap={2} p={2} borderRadius={3} bgcolor={theme.palette.background.paper}>
      <ShieldTick size={28} color={theme.palette.success.dark} variant="Bulk" />
      <Box flex={1} minWidth={0}>
        <Box display="flex" justifyContent="space-between" alignItems="baseline" gap={1}>
          <Typography color="text.primary" variant="body2" fontWeight={500}>
            {t({ id: 'dashboardIdentityVerified' })}
          </Typography>
          <Typography color="text.primary" variant="h3" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(share * 100)}%
          </Typography>
        </Box>
        <Typography color="text.secondary" variant="caption">
          {t({ id: 'dashboardVerifiedOf' }, { verified: formatCount(verified), total: formatCount(total) })}
        </Typography>
      </Box>
    </Box>
  )
}

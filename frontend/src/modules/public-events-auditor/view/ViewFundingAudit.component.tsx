import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Dayjs } from 'dayjs'
import { ReactNode, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { publicTransactionsIllustration } from 'assets/images'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { AuditAllocationChart } from 'modules/public-events-auditor/components/AuditAllocationChart/AuditAllocationChart.component.tsx'
import { AuditKpiHeader } from 'modules/public-events-auditor/components/AuditKpiHeader/AuditKpiHeader.component.tsx'
import { AuditPeriodFilter } from 'modules/public-events-auditor/components/AuditPeriodFilter/AuditPeriodFilter.component.tsx'
import { AuditProjectTable } from 'modules/public-events-auditor/components/AuditProjectTable/AuditProjectTable.component.tsx'
import { AuditSpendingLedger } from 'modules/public-events-auditor/components/AuditSpendingLedger/AuditSpendingLedger.component.tsx'
import { useFundingAudit } from 'modules/public-events-auditor/hooks/useFundingAudit.ts'

const Section = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => {
  const theme = useTheme()

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography color={theme.palette.text.primary} variant="h3">
          {title}
        </Typography>
        {description && (
          <Typography color={theme.palette.text.secondary} variant="body2">
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  )
}

export const ViewFundingAudit = () => {
  const { t } = useTranslations()
  const theme = useTheme()
  const { organisationId: orgIdFromPath } = useParams<{ organisationId: string }>()
  const [searchParams] = useSearchParams()
  const { organisations, selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext()

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)

  useEffect(() => {
    const orgId = orgIdFromPath || searchParams.get('organisation_id')
    if (orgId && organisations?.length > 0) {
      const organisationExists = organisations.some((o: { id: string }) => o.id === orgId)
      if (organisationExists) {
        setSelectedOrganisation(orgId)
      }
    }
  }, [orgIdFromPath, searchParams, organisations, setSelectedOrganisation])

  const effectiveOrganisation = selectedOrganisation || orgIdFromPath || ''

  const toApiDate = (value: Dayjs | null) => (value ? value.format('YYYY-MM-DD') : undefined)

  const { audit, isFetching, hasOrganisation } = useFundingAudit(effectiveOrganisation, toApiDate(dateFrom), toApiDate(dateTo))

  const clearPeriod = () => {
    setDateFrom(null)
    setDateTo(null)
  }

  const isEmptyResult = Boolean(audit && audit.fundingCount === 0 && audit.spendingCount === 0 && audit.refundCount === 0)

  const renderBody = () => {
    if (!hasOrganisation) {
      return (
        <EmptyStatePage
          asset={<Box alt={t({ id: 'auditNoOrganisationMessage' })} component="img" maxWidth="47.5rem" src={publicTransactionsIllustration} width="100%" />}
          hint={t({ id: 'auditNoOrganisationHint' })}
          message={t({ id: 'auditNoOrganisationMessage' })}
        />
      )
    }

    if (isFetching && !audit) {
      return (
        <Box alignItems="center" display="flex" height="100%" justifyContent="center" minHeight="20rem">
          <LoaderCentered size={40} />
        </Box>
      )
    }

    if (!audit || isEmptyResult) {
      return <EmptyStateTable hint={t({ id: 'auditNoDataHint' })} message={t({ id: 'auditNoDataMessage' })} />
    }

    return (
      <Box display="flex" flexDirection="column" gap={6}>
        <AuditKpiHeader audit={audit} />

        <Section description={t({ id: 'auditAllocationChartDescription' })} title={t({ id: 'auditAllocationChartTitle' })}>
          <Box
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '22rem', p: 2, backgroundColor: theme.palette.background.paper }}>
            <AuditAllocationChart currency={audit.currency} projects={audit.projects} />
          </Box>
        </Section>

        <Section description={t({ id: 'auditProjectBreakdownDescription' })} title={t({ id: 'auditProjectBreakdownTitle' })}>
          {audit.projects.length ? (
            <AuditProjectTable currency={audit.currency} projects={audit.projects} />
          ) : (
            <Typography color={theme.palette.text.secondary} variant="body2">
              {t({ id: 'nothingHereMessage' })}
            </Typography>
          )}
        </Section>

        <Section description={t({ id: 'auditSpendingLedgerDescription' })} title={t({ id: 'auditSpendingLedgerTitle' })}>
          {audit.spending.length ? (
            <AuditSpendingLedger currency={audit.currency} spending={audit.spending} />
          ) : (
            <Typography color={theme.palette.text.secondary} variant="body2">
              {t({ id: 'nothingHereMessage' })}
            </Typography>
          )}
        </Section>
      </Box>
    )
  }

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'auditViewDescription' })} title={t({ id: 'auditViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={4}>
        {hasOrganisation && audit && (
          <AuditPeriodFilter dateFrom={dateFrom} dateTo={dateTo} onClear={clearPeriod} onDateFromChange={setDateFrom} onDateToChange={setDateTo} />
        )}
        {renderBody()}
      </LayoutPublic.Main>
    </>
  )
}

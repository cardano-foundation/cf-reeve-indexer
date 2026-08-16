import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Dayjs } from 'dayjs'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { publicTransactionsIllustration } from 'assets/images'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useGetEventProjectsModel } from 'libs/models/events-model/GetEventProjects/GetEventProjectsModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'
import { AutocompleteMultipleOption } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { AuditAllocationChart } from 'modules/public-events-auditor/components/AuditAllocationChart/AuditAllocationChart.component.tsx'
import { AuditEventDetailModal, SelectedEvent } from 'modules/public-events-auditor/components/AuditEventDetailModal/AuditEventDetailModal.component.tsx'
import { AuditEventsLedger } from 'modules/public-events-auditor/components/AuditEventsLedger/AuditEventsLedger.component.tsx'
import { AuditFilterBar } from 'modules/public-events-auditor/components/AuditFilterBar/AuditFilterBar.component.tsx'
import { AuditKpiHeader } from 'modules/public-events-auditor/components/AuditKpiHeader/AuditKpiHeader.component.tsx'
import { AuditProjectTable } from 'modules/public-events-auditor/components/AuditProjectTable/AuditProjectTable.component.tsx'
import { useFundingAudit } from 'modules/public-events-auditor/hooks/useFundingAudit.ts'

import { ProjectCard } from 'modules/public-events-auditor/components/ProjectCard/ProjectCard.component.tsx'
import { ProjectCardsGrid } from '../components/ProjectCardsGrid/ProjectCardsGrid.component'
import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'

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
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null)

  const handleSelectEvent = (txHash: string, eventId: string) => setSelectedEvent({ txHash, eventId })

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

  const { audit, isFetching, hasOrganisation } = useFundingAudit(effectiveOrganisation, toApiDate(dateFrom), toApiDate(dateTo), selectedProjectIds)

  const { projects: projectList } = useGetEventProjectsModel({ parameters: { organisationId: effectiveOrganisation } }, Boolean(effectiveOrganisation))

  const projectOptions = useMemo<AutocompleteMultipleOption[]>(
    () => (projectList ?? []).map((project) => ({ name: project.projectTitle || project.projectId, value: project.projectId })),
    [projectList]
  )

  // A different organisation has its own projects, so drop any project selection when it changes.
  useEffect(() => {
    setSelectedProjectIds([])
  }, [effectiveOrganisation])

  const clearFilters = () => {
    setDateFrom(null)
    setDateTo(null)
    setSelectedProjectIds([])
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

    const fakeProjects: ProjectAuditView[] = [
      { projectKey: 'p1', projectId: 'proj-1', projectTitle: 'Project AB', currency: 'EUR', allocatedAmount: 200000, spentAmount: 175000, remaining: 25000, milestones: [] },
      { projectKey: 'p2', projectId: 'proj-2', projectTitle: 'Project CD', currency: 'ADA', allocatedAmount: 200000, spentAmount: 175000, remaining: 25000, milestones: [] },
      { projectKey: 'p3', projectId: 'proj-3', projectTitle: 'A Much Longer Project Name For Testing', currency: 'EUR', allocatedAmount: 50000, spentAmount: 12500, remaining: 37500, milestones: [] },
      { projectKey: 'p4', projectId: 'proj-4', projectTitle: 'Project EF', currency: 'ADA', allocatedAmount: 80000, spentAmount: 80000, remaining: 0, milestones: [] },
      { projectKey: null, projectId: 'proj-5', projectTitle: null, currency: 'EUR', allocatedAmount: 15000, spentAmount: 4200, remaining: 10800, milestones: [] },
      { projectKey: 'p6', projectId: 'proj-6', projectTitle: 'Project GH', currency: 'ADA', allocatedAmount: 120000, spentAmount: 95000, remaining: 25000, milestones: [] },
      { projectKey: 'p7', projectId: 'proj-7', projectTitle: 'Project IJ', currency: 'EUR', allocatedAmount: 60000, spentAmount: 15000, remaining: 45000, milestones: [] }
    ]


    return (

      <Box display="flex" flexDirection="column" gap={6}>

        <ProjectCardsGrid projects={fakeProjects} />

        <AuditKpiHeader audit={audit} />

        <Section description={t({ id: 'auditAllocationChartDescription' })} title={t({ id: 'auditAllocationChartTitle' })}>
          <Box
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '22rem', p: 2, backgroundColor: theme.palette.background.paper }}>
            <AuditAllocationChart currency={audit.currency} projects={audit.projects} />
          </Box>
        </Section>

        <Section description={t({ id: 'auditProjectBreakdownDescription' })} title={t({ id: 'auditProjectBreakdownTitle' })}>
          {audit.projects.length ? (
            <AuditProjectTable currency={audit.currency} events={audit.events} projects={audit.projects} onSelectEvent={handleSelectEvent} />
          ) : (
            <Typography color={theme.palette.text.secondary} variant="body2">
              {t({ id: 'nothingHereMessage' })}
            </Typography>
          )}
        </Section>

        <Section description={t({ id: 'auditAllEventsDescription' })} title={t({ id: 'auditAllEventsTitle' })}>
          <AuditEventsLedger dateFrom={toApiDate(dateFrom)} dateTo={toApiDate(dateTo)} organisationId={effectiveOrganisation} projectIds={selectedProjectIds} />
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
          <AuditFilterBar
            dateFrom={dateFrom}
            dateTo={dateTo}
            projectOptions={projectOptions}
            selectedProjectIds={selectedProjectIds}
            onClear={clearFilters}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onProjectsChange={setSelectedProjectIds}
          />
        )}
        {renderBody()}
      </LayoutPublic.Main>
      <AuditEventDetailModal selected={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  )
}

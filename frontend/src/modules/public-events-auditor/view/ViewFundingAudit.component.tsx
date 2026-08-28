import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Dayjs } from 'dayjs'
import { FilterRemove } from 'iconsax-react'
import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { publicProjectsIllustration } from 'assets/images'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { AuditFilterBar } from 'modules/public-events-auditor/components/AuditFilterBar/AuditFilterBar.component.tsx'
import { ProjectBreakdownProjects } from 'modules/public-events-auditor/components/ProjectBreakdownProjects/ProjectBreakdownProjects.component.tsx'
import { useFundingAudit } from 'modules/public-events-auditor/hooks/useFundingAudit.ts'
import { formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'
import { projectKey } from 'modules/public-events-auditor/utils/projectKey.ts'
import { getOrgPath } from 'routes'

import { ProjectCardsGrid } from '../components/ProjectCardsGrid/ProjectCardsGrid.component'

const Section = ({
  title,
  titleAction,
  description,
  action,
  children
}: {
  title: string
  titleAction?: ReactNode
  description?: string
  action?: ReactNode
  children: ReactNode
}) => {
  const theme = useTheme()

  return (
    <Box display="flex" flexDirection="column" flex={1} minHeight={0} gap={2}>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography color={theme.palette.text.primary} variant="h3">
              {title}
            </Typography>
            {titleAction}
          </Box>
          {action}
        </Box>
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
  const navigate = useNavigate()
  const { organisationId: orgIdFromPath } = useParams<{ organisationId: string }>()
  const [searchParams] = useSearchParams()
  const { organisations, selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext()

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)
  const [selectedProjectKeys, setSelectedProjectKeys] = useState<string[]>([])

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

  const clearFilters = () => {
    setDateFrom(null)
    setDateTo(null)
  }

  const isEmptyResult = Boolean(audit && audit.fundingCount === 0 && audit.spendingCount === 0 && audit.refundCount === 0)
  const hasActiveDateFilter = Boolean(dateFrom || dateTo)
  const showFilters = hasOrganisation && audit && (!isEmptyResult || hasActiveDateFilter)

  const renderBody = () => {

    if (!hasOrganisation) {
      return (
        <EmptyStatePage
          asset={<Box alt={t({ id: 'auditNoOrganisationMessage' })} component="img" maxWidth="47.5rem" src={publicProjectsIllustration} width="100%" />}
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
      return hasActiveDateFilter ? (
        <EmptyStatePage
          asset={<FilterRemove color={theme.palette.action.disabled} size={56} variant="Outline" />}
          hint={t({ id: 'noResultsHint' })}
          message={t({ id: 'noResultsMessage' })}
        />
      ) : (
        <EmptyStatePage
          asset={<Box alt={t({ id: 'auditNoDataMessage' })} component="img" maxWidth="47.5rem" src={publicProjectsIllustration} width="100%" />}
          hint={t({ id: 'auditNoDataHint' })}
          message={t({ id: 'auditNoDataMessage' })}
        />
      )
    }

    const projects = audit.projects
    const keyedProjects = projects.map((project, index) => ({ project, key: projectKey(project, index) }))
    const activeKeys = selectedProjectKeys.filter((key) => keyedProjects.some((entry) => entry.key === key))
    const visibleProjects =
      activeKeys.length === 0 ? projects : keyedProjects.filter((entry) => activeKeys.includes(entry.key)).map((entry) => entry.project)

    return (
      <Section
        title={t({ id: 'auditProjectBreakdownTitle' })}
        titleAction={
          activeKeys.length > 0 && (
            <Link component="button" type="button" underline="hover" onClick={() => setSelectedProjectKeys([])} sx={{ color: '#408AD8', fontWeight: 600 }}>
              {t({ id: 'clearAll' })}
            </Link>
          )
        }
        action={
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate(getOrgPath('projects/events', effectiveOrganisation))}
            sx={{ color: '#408AD8', fontWeight: 600 }}>
            {t({ id: 'auditViewAllEvents' })}
          </Link>
        }>
        <Box display="flex" flexDirection="column" flex={1} minHeight={0} gap={4}>
          <ProjectCardsGrid projects={projects} selectedKeys={activeKeys} onSelectKeys={setSelectedProjectKeys} organisationId={effectiveOrganisation} />
          <ProjectBreakdownProjects projects={visibleProjects} forceExpandedIds={activeKeys} />
        </Box>
      </Section>
    )
  }

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'auditViewDescription' })} title={t({ id: 'auditViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={2}>
        {showFilters && (
          <Box display="flex" alignItems="flex-start" flexWrap="wrap-reverse" gap={1.5}>
            <AuditFilterBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              onClear={clearFilters}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
            {audit?.lastEventDate && (
              <Box
                sx={{
                  display: 'flex',
                  flexBasis: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  marginLeft: { xs: 0, md: 'auto' },
                  alignSelf: 'center'
                }}
              >
                <Chip color="info" label={t({ id: 'auditLastUpdated' }, { date: formatAuditDate(audit.lastEventDate) })} />
              </Box>
            )}
          </Box>
        )}
        {renderBody()}
      </LayoutPublic.Main>
    </>
  )
}

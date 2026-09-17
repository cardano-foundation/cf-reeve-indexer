import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { FormikProvider } from 'formik'
import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { publicReportsIllustration } from 'assets/images'
import { ButtonPrimary, ButtonSecondary } from 'features/common'
import { LegalDisclosureAttribution } from 'libs/layout-kit/layout-public/components/LegalDisclosureAttribution/LegalDisclosureAttribution.component.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { LegalDisclosureButton } from 'libs/ui-kit/components/LegalDisclosureButton/LegalDisclosureButton.component.tsx'
import { ModalReport } from 'modules/public-reports/components'
import { PublicReportsContextProvider } from 'modules/public-reports/components/PublicReportsContext/PublicReportsContext.component'
import { ReportsFilters } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.component'
import { TableReportsPublic } from 'modules/public-reports/components/TablePublicReports/TablePublicReports.component'
import { usePublicReports } from 'modules/public-reports/hooks/usePublicReports.ts'

export const ViewReportsPublic = () => {
  const { t } = useTranslations()
  const { organisationId: orgIdFromPath } = useParams<{ organisationId: string }>()
  const [searchParams] = useSearchParams()
  const { organisations, setSelectedOrganisation } = useLayoutPublicContext()

  const { data, drawer, filters, options, pagination, sorting, modal } = usePublicReports()

  useEffect(() => {
    const orgId = orgIdFromPath || searchParams.get('organisation_id')
    if (orgId && organisations?.length > 0) {
      const organisationExists = organisations.some((o: any) => o.id === orgId)
      if (organisationExists) {
        setSelectedOrganisation(orgId)
      }
    }
  }, [orgIdFromPath, searchParams, organisations, setSelectedOrganisation])

  const { reports, hasEmptyPageState, isFetching } = data

  const { handleDrawerClose, isDrawerOpen: isFiltersDrawerOpen } = drawer

  const { filters: drawerFilters, quickFilters, handleClearFilters, hasFiltersSelected, isApplyDisabled, isClearDisabled } = filters

  const { report, handleReportViewOpen, handleReportViewClose, isReportViewOpen } = modal

  return (
    <PublicReportsContextProvider value={{ filters, options }}>
      <LayoutPublic.Header>
        <Box flex="1 1 auto" minWidth={0}>
          <LayoutPublic.Header.Details description={t({ id: 'publicInterfaceViewDescription' })} title={t({ id: 'reports' })} />
        </Box>
        <LegalDisclosureButton />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} hasMinContentHeight isHeightRestricted>
        {hasEmptyPageState ? (
          <EmptyStatePage
            asset={<Box alt={t({ id: 'noPublicReportsMessage' })} component="img" maxWidth="47.5rem" src={publicReportsIllustration} width="100%" />}
            hint={t({ id: 'noPublicReportsHint' }, { organisation: 'Cardano Foundation' })}
            message={t({ id: 'noPublicReportsMessage' })}
          />
        ) : (
          <Box display="flex" flexDirection="column" gap={1} height="100%" minHeight={0}>
            <LegalDisclosureAttribution />
            <Box display="flex" flexDirection="column" flex="1 1 0" minHeight="15rem">
              <FormikProvider value={quickFilters}>
                <TableReportsPublic
                  data={reports}
                  pagination={pagination}
                  sorting={sorting}
                  onViewOpen={handleReportViewOpen}
                  hasFiltersSelected={hasFiltersSelected}
                  isFetching={isFetching}
                />
              </FormikProvider>
            </Box>
          </Box>
        )}
      </LayoutPublic.Main>
      <LayoutPublic.Drawer open={isFiltersDrawerOpen}>
        <LayoutPublic.Drawer.Header title={t({ id: 'filters' })} onClose={handleDrawerClose} />
        <LayoutPublic.Drawer.Content>
          <FormikProvider value={drawerFilters}>
            <ReportsFilters {...{ options }} />
          </FormikProvider>
        </LayoutPublic.Drawer.Content>
        <LayoutPublic.Drawer.Footer>
          <Grid container size="grow" spacing={2}>
            <Grid size="grow">
              <ButtonSecondary type="button" onClick={handleClearFilters} disabled={isClearDisabled} fullWidth>
                {t({ id: 'clearAll' })}
              </ButtonSecondary>
            </Grid>
            <Grid size="grow">
              <ButtonPrimary form="public-reports-filters" type="submit" disabled={isApplyDisabled} fullWidth>
                {t({ id: 'applyFilters' })}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </LayoutPublic.Drawer.Footer>
      </LayoutPublic.Drawer>
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
    </PublicReportsContextProvider>
  )
}

// import Box from '@mui/material/Box'
import { FormikProvider } from 'formik'

import { ButtonPrimary, ButtonSecondary } from 'features/common'
import { Grid } from 'features/mui/base'
// import { publicReportsIllustration } from 'assets/images'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
// import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { ModalReport } from 'modules/public-reports/components'
import { PublicReportsContextProvider } from 'modules/public-reports/components/PublicReportsContext/PublicReportsContext.component'
import { ReportsFilters } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.component'
import { TableReportsPublic } from 'modules/public-reports/components/TablePublicReports/TablePublicReports.component'
import { usePublicReports } from 'modules/public-reports/hooks/usePublicReports.ts'

export const ViewReportsPublic = () => {
  const { t } = useTranslations()

  const { data, drawer, filters, options, pagination, sorting, modal } = usePublicReports()

  const { reports, isFetching } = data

  const { handleDrawerClose, isDrawerOpen: isFiltersDrawerOpen } = drawer

  const { filters: drawerFilters, quickFilters, handleClearFilters, hasFiltersSelected, isApplyDisabled, isClearDisabled } = filters

  const { report, handleReportViewOpen, handleReportViewClose, isReportViewOpen } = modal

  return (
    <PublicReportsContextProvider value={{ filters, options }}>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicInterfaceViewDescription' })} title={t({ id: 'reports' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
        {/* {hasEmptyPageState ? (
          <EmptyStatePage
            asset={<Box alt={t({ id: 'noPublicReportsMessage' })} component="img" maxWidth="47.5rem" src={publicReportsIllustration} width="100%" />}
            hint={t({ id: 'noPublicReportsHint' }, { organisation: 'Cardano Foundation' })}
            message={t({ id: 'noPublicReportsMessage' })}
          />
        ) : (
          <TableReportsPublic data={reports} onViewOpen={handleReportViewOpen} areFiltersSelected={areFiltersSelected} isFetching={isFetching} />
        )} */}
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

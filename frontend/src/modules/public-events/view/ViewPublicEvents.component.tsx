import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { FormikProvider } from 'formik'
import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { publicTransactionsIllustration } from 'assets/images'
import { ButtonPrimary, ButtonSecondary } from 'features/common'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { PublicEventsContextProvider } from 'modules/public-events/components/PublicEventsContext/PublicEventsContext.component.tsx'
import { SearchedEvents } from 'modules/public-events/components/SearchedEvents/SearchedEvents.component.tsx'
import { SearchFilters } from 'modules/public-events/components/SearchFilters/SearchFilters.component.tsx'
import { usePublicEvents } from 'modules/public-events/hooks/usePublicEvents.ts'

export const ViewPublicEvents = () => {
  const { t } = useTranslations()
  const { organisationId: orgIdFromPath } = useParams<{ organisationId: string }>()
  const [searchParams] = useSearchParams()
  const { organisations, setSelectedOrganisation } = useLayoutPublicContext()

  const { data, drawer, filters, options, pagination, sorting } = usePublicEvents()

  useEffect(() => {
    const orgId = orgIdFromPath || searchParams.get('organisation_id')
    if (orgId && organisations?.length > 0) {
      const organisationExists = organisations.some((o: { id: string }) => o.id === orgId)
      if (organisationExists) {
        setSelectedOrganisation(orgId)
      }
    }
  }, [orgIdFromPath, searchParams, organisations, setSelectedOrganisation])

  const { events, hasEmptyPageState, isFetching } = data

  const { handleDrawerClose, isDrawerOpen } = drawer

  const { filters: drawerFilters, quickFilters, handleClearFilters, hasFiltersSelected, isApplyDisabled, isClearDisabled } = filters

  return (
    <PublicEventsContextProvider value={{ filters, options }}>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicEventsViewDescription' })} title={t({ id: 'publicEventsViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
        {hasEmptyPageState ? (
          <EmptyStatePage
            asset={<Box alt={t({ id: 'noPublicEventsMessage' })} component="img" maxWidth="47.5rem" src={publicTransactionsIllustration} width="100%" />}
            hint={t({ id: 'noPublicEventsHint' }, { organisation: 'Cardano Foundation' })}
            message={t({ id: 'noPublicEventsMessage' })}
          />
        ) : (
          <FormikProvider value={quickFilters}>
            <SearchedEvents data={events} pagination={pagination} sorting={sorting} hasFiltersSelected={hasFiltersSelected} isLoading={isFetching} />
          </FormikProvider>
        )}
      </LayoutPublic.Main>
      <LayoutPublic.Drawer open={isDrawerOpen}>
        <LayoutPublic.Drawer.Header title={t({ id: 'filters' })} onClose={handleDrawerClose} />
        <LayoutPublic.Drawer.Content>
          <FormikProvider value={drawerFilters}>
            <SearchFilters />
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
              <ButtonPrimary form="public-events-filters" type="submit" disabled={isApplyDisabled} fullWidth>
                {t({ id: 'applyFilters' })}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </LayoutPublic.Drawer.Footer>
      </LayoutPublic.Drawer>
    </PublicEventsContextProvider>
  )
}

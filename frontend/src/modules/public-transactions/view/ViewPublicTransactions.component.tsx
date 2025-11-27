import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { FormikProvider } from 'formik'

import { publicTransactionsIllustration } from 'assets/images'
import { ButtonPrimary, ButtonSecondary } from 'features/common'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { PublicTransactionsContextProvider } from 'modules/public-transactions/components/PublicTransactionsContext/PublicTransactionsContext.component.tsx'
import { SearchedTransactions } from 'modules/public-transactions/components/SearchedTransactions/SearchedTransactions.component.tsx'
import { SearchFilters } from 'modules/public-transactions/components/SearchFilters/SearchFilters.component.tsx'
import { usePublicTransactions } from 'modules/public-transactions/hooks/usePublicTransactions.ts'

export const ViewPublicTransactions = () => {
  const { t } = useTranslations()

  const { data, drawer, filters, options, pagination, sorting } = usePublicTransactions()

  const { transactions, hasEmptyPageState, isFetching } = data

  const { handleDrawerClose, isDrawerOpen } = drawer

  const { filters: drawerFilters, quickFilters, handleClearFilters, hasFiltersSelected, isApplyDisabled, isClearDisabled } = filters

  return (
    <PublicTransactionsContextProvider value={{ filters, options }}>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicTransactionsViewDescription' })} title={t({ id: 'publicTransactionsViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
        {hasEmptyPageState ? (
          <EmptyStatePage
            asset={<Box alt={t({ id: 'noPublicTransactionsMessage' })} component="img" maxWidth="47.5rem" src={publicTransactionsIllustration} width="100%" />}
            hint={t({ id: 'noPublicTransactionsHint' }, { organisation: 'Cardano Foundation' })}
            message={t({ id: 'noPublicTransactionsMessage' })}
          />
        ) : (
          <FormikProvider value={quickFilters}>
            <SearchedTransactions data={transactions} pagination={pagination} sorting={sorting} hasFiltersSelected={hasFiltersSelected} isLoading={isFetching} />
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
              <ButtonPrimary form="public-transactions-filters" type="submit" disabled={isApplyDisabled} fullWidth>
                {t({ id: 'applyFilters' })}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </LayoutPublic.Drawer.Footer>
      </LayoutPublic.Drawer>
    </PublicTransactionsContextProvider>
  )
}

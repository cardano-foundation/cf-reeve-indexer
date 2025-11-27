<<<<<<< HEAD
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useGetCurrenciesModel } from 'libs/models/organisation-model/GetCurrencies/GetCurrencies.service.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'

export const usePublicTransactionsQueries = () => {
  const { selectedOrganisation } = useLayoutPublicContext()
  
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel({ hasAuthorizationHeader: false })
  const { currencies, isFetching: isFetchingCurrencies } = useGetCurrenciesModel(selectedOrganisation)
=======
import { useMemo } from 'react'

import { useGetPublicTransactionsModel } from 'libs/models/transactions-model/GetPublicTransactions/GetPublicTransactionsModel.service.ts'
import { SearchFiltersValues } from 'modules/public-transactions/components/SearchFilters/SearchFilters.types'
import { SearchQuickFiltersValues } from 'modules/public-transactions/components/SearchToolbar/SearchToolbar.types'
import { mapSearchFiltersToRequestBody } from 'modules/public-transactions/utils/payload.ts'
>>>>>>> main

interface PublicTransactionsQueriesState {
  filters: SearchQuickFiltersValues & SearchFiltersValues
  pagination: { page: number; size: number }
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' | null | undefined }
}

export const usePublicTransactionsQueries = (state: PublicTransactionsQueriesState) => {
  const {
    filters,
    pagination: { page, size },
    sorting: { sortBy, sortOrder }
  } = state

  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'

  const filtersPayload = useMemo(() => mapSearchFiltersToRequestBody(filters), [filters])

  const hasSomeFilters = Object.values(filtersPayload).some((value) => Boolean(value))

  const { transactions, isTransactionsFetching } = useGetPublicTransactionsModel(
    {
      parameters: { page, size, sort: [`${sortBy},${sortOrder}`] },
      body: {
        organisationId: selectedOrganisation,
        ...(hasSomeFilters ? filtersPayload : {})
      }
    },
    [filters, page, size, sortBy, sortOrder]
  )

  const isFetching = isTransactionsFetching

  return { transactions, isFetching }
}

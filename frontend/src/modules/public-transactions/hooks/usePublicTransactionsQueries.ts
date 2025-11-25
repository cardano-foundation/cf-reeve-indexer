import { useMemo } from 'react'

import { useGetPublicTransactionsModel } from 'libs/models/transactions-model/GetPublicTransactions/GetPublicTransactionsModel.service.ts'
import { mapSearchFiltersToRequestBody } from 'modules/public-transactions/utils/payload.ts'

interface PublicTransactionsQueriesState {
  filters: any
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

import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'
import { useGetTransactionTypesModel } from 'libs/models/transactions-model/GetTransactionsTypes/GetTransactionTypes.service.ts'

export const useImportQueries = () => {
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel()
  const { transactionTypes, isFetching: isFetchingTransactionTypes } = useGetTransactionTypesModel()

  const isFetching = isFetchingOrganisations || isFetchingTransactionTypes

  return {
    organisations,
    transactionTypes,
    isFetching
  }
}

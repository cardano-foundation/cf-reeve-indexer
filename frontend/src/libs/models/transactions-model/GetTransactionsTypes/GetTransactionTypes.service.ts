import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { mapGetTransactionsTypesApiResponseToDTO } from 'libs/models/transactions-model/GetTransactionsTypes/GetTransactionsTypes.dto.ts'

const getTransactionTypesQuery = async () => {
  const { transactionsApi } = backendReeveApi()

  const data = await transactionsApi.getTransactionTypes()

  if (!data) return null

  return mapGetTransactionsTypesApiResponseToDTO(data)
}

export const useGetTransactionTypesModel = () => {
  const { data, isFetching } = useQuery({ queryKey: ['TRANSACTION_TYPES'], queryFn: () => getTransactionTypesQuery() })

  return {
    transactionTypes: data ?? null,
    isFetching
  }
}

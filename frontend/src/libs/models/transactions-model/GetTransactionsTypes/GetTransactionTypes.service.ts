import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { mapGetTransactionsTypesApiResponseToDTO } from 'libs/models/transactions-model/GetTransactionsTypes/GetTransactionsTypes.dto.ts'

const getTransactionTypesQuery = async () => {
  const { transactionsApi } = backendLobApi()

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

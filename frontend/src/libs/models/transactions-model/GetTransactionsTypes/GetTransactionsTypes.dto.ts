import { TransactionsTypesApiResponse } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

import { TransactionsTypesDTO } from './GetTransactionTypes.types.ts'

export const mapGetTransactionsTypesApiResponseToDTO = (response: TransactionsTypesApiResponse): TransactionsTypesDTO => {
  const transactionsTypesDTO = response.map(({ title, id }) => {
    return {
      name: title,
      value: id
    }
  })

  return transactionsTypesDTO
}

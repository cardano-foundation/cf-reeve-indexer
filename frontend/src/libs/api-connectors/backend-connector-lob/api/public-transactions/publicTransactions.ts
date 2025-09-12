import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  GetPublicTransactionsParameters,
  GetPublicTransactionsRequest,
  GetPublicTransactionsResponse200
} from 'libs/api-connectors/backend-connector-lob/api/public-transactions/publicTransactions.types.ts'

export const publicTransactionsApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const getPublicTransactions = (request: GetPublicTransactionsRequest, parameters: GetPublicTransactionsParameters) => {
    const { page, size } = parameters

    return post<GetPublicTransactionsResponse200, GetPublicTransactionsRequest>(`api/v1/public/transactions?page=${page}&size=${size}`, request, { Authorization: '' })
  }

  return {
    getPublicTransactions
  }
}

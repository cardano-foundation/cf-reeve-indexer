import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  GetPublicTransactionsParameters,
  GetPublicTransactionsRequest,
  GetPublicTransactionsResponse200
} from 'libs/api-connectors/backend-connector-lob/api/transactions/publicTransactions.types.ts'

export const transactionsApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const getTransactions = (request: GetPublicTransactionsRequest, parameters: GetPublicTransactionsParameters) => {
    const { page, size } = parameters

    return post<GetPublicTransactionsResponse200, GetPublicTransactionsRequest>(`api/v1/transactions?page=${page}&size=${size}`, request, { Authorization: '' })
  }

  return {
    getTransactions
  }
}

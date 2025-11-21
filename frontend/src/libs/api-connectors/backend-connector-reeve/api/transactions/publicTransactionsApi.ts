import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import {
  PostPublicTransactionsRequest,
  PostPublicTransactionsRequestBody,
  PostPublicTransactionsResponse200
} from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi.types'

export const transactionsApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const getTransactions = (request: PostPublicTransactionsRequest) => {
    const {
      parameters: { page, size, sort },
      body
    } = request

    const url = 'api/v1/transactions'

    let queryParams = []

    if (page !== undefined) {
      queryParams.push(`page=${page}`)
    }

    if (size !== undefined) {
      queryParams.push(`size=${size}`)
    }

    if (sort !== undefined) {
      queryParams.push(`sort=${sort}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return post<PostPublicTransactionsResponse200, PostPublicTransactionsRequestBody>(`${url}${queryString}`, body, { Authorization: '' })
  }

  return {
    getTransactions
  }
}

import { GetExtractedTransactionsRequest, GetExtractedTransactionsResponse200 } from 'libs/api-connectors/backend-connector-lob/api/extraction/extractionApi.types.ts'
import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'

export const extractionApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const getExtractedTransactions = (request: GetExtractedTransactionsRequest) => {
    return post<GetExtractedTransactionsResponse200, GetExtractedTransactionsRequest>(`api/v1/extraction/search`, request)
  }

  return {
    getExtractedTransactions
  }
}

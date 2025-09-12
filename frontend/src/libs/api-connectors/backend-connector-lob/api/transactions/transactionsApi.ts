import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  ApproveTransactionsApiRequest,
  ApproveTransactionsApiResponse,
  ExtractTransactionsApiRequest,
  ExtractTransactionsApiResponse,
  GetFilterOptionsRequest,
  GetFilterOptionsResponse,
  PublishTransactionsApiRequest,
  PublishTransactionsApiResponse,
  RejectTransactionsApiRequest,
  RejectTransactionsApiResponse,
  TransactionsRejectionReasonsApiResponse,
  TransactionsTypesApiResponse,
  UploadTransactionsApiRequest,
  UploadTransactionsApiResponse
} from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'
import { Headers, MediaTypes } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'

export const transactionsApi = (baseUrl: string) => {
  const { get, post } = httpService(baseUrl)

  const getTransactionTypes = () => {
    return get<TransactionsTypesApiResponse>(`api/v1/transaction-types`)
  }

  const extractTransactions = (request: ExtractTransactionsApiRequest) => {
    return post<ExtractTransactionsApiResponse, ExtractTransactionsApiRequest>('api/v1/extraction', request)
  }

  const uploadTransactions = (request: UploadTransactionsApiRequest) => {
    return post<UploadTransactionsApiResponse, UploadTransactionsApiRequest>('api/v1/extraction', request, { [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA })
  }

  const validateUploadTransactions = (request: UploadTransactionsApiRequest) => {
    return post<UploadTransactionsApiResponse, UploadTransactionsApiRequest>('api/v1/extraction/validation', request, { [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA })
  }

  const approveTransactions = (request: ApproveTransactionsApiRequest) => {
    return post<ApproveTransactionsApiResponse, ApproveTransactionsApiRequest>(`api/v1/transactions/approve`, request)
  }

  const rejectTransactions = (request: RejectTransactionsApiRequest) => {
    return post<RejectTransactionsApiResponse, RejectTransactionsApiRequest>(`api/v1/transaction/reject`, request)
  }

  const getTransactionsRejectionReasons = () => {
    return get<TransactionsRejectionReasonsApiResponse>(`api/v1/rejection-reasons`)
  }

  const publishTransactions = (request: PublishTransactionsApiRequest) => {
    return post<PublishTransactionsApiResponse, PublishTransactionsApiRequest>(`api/v1/transactions/publish`, request)
  }

  const getFilterOptions = (request: GetFilterOptionsRequest) => {
    const {
      parameters: { organisationId, filterOptions }
    } = request

    let url = `api/v1/filter-options/${organisationId}`

    const queryParams: string[] = []

    if (filterOptions.length > 0) {
      filterOptions.map((filter) => {
        queryParams.push(`filterOptions=${filter}`)
      })
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`
    }

    return get<GetFilterOptionsResponse>(url)
  }

  return {
    getTransactionTypes,
    extractTransactions,
    uploadTransactions,
    validateUploadTransactions,
    approveTransactions,
    rejectTransactions,
    getTransactionsRejectionReasons,
    publishTransactions,
    getFilterOptions
  }
}

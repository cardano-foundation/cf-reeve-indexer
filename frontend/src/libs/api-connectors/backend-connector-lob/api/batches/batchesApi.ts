import { httpService } from '../httpService'

import {
  BatchApiParameters,
  BatchApiResponse,
  BatchesApiParameters,
  BatchesApiRequest,
  BatchesApiResponse,
  BatchReprocessApiResponse,
  PostBatchDetailsRequest,
  PostBatchDetailsRequestBody
} from './batchesApi.types.ts'

export const batchesApi = (baseUrl: string) => {
  const { post, get } = httpService(baseUrl)

  const getBatches = (request: BatchesApiRequest, parameters: BatchesApiParameters) => {
    return post<BatchesApiResponse, BatchesApiRequest>(`api/v1/batches?page=${parameters.page}&size=${parameters.size}`, request)
  }

  const getBatch = (request: PostBatchDetailsRequest) => {
    const {
      parameters: { batchId, page, size, sort, status },
      body = {}
    } = request

    let url = `api/v1/batches/${batchId}`

    const queryParams: string[] = []

    if (page !== undefined) {
      queryParams.push(`page=${page}`)
    }

    if (size !== undefined) {
      queryParams.push(`size=${size}`)
    }

    if (sort !== undefined) {
      queryParams.push(`sort=${sort}`)
    }

    if (status !== undefined) {
      status.forEach((status) => {
        queryParams.push(`txStatus=${status}`)
      })
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`
    }

    return post<BatchApiResponse, PostBatchDetailsRequestBody>(url, body)
  }

  const reprocessBatch = (parameters: BatchApiParameters) => {
    return get<BatchReprocessApiResponse>(`api/v1/batches/reprocess/${parameters.batchId}`)
  }

  return {
    getBatches,
    getBatch,
    reprocessBatch
  }
}

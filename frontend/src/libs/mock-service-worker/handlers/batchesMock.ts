import { http, HttpResponse } from 'msw'

import { BATCH_MOCK, BATCH_REPROCESS_RESPONSE_MOCK, BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

export const batchMock = http.get(`${API_BASE_URL_MOCK}/api/v1/batches/:batchId`, ({ request }) => {
  const url = new URL(request.url)

  const page = url.searchParams.get('page')
  const size = url.searchParams.get('size')
  const txStatus = url.searchParams.get('txStatus')

  if ((page && size) || (page && size && txStatus)) {
    return HttpResponse.json(BATCH_MOCK)
  }

  return HttpResponse.json(BATCH_MOCK)
})

export const batchesMock = http.post(`${API_BASE_URL_MOCK}/api/v1/batches`, ({ request }) => {
  const url = new URL(request.url)

  const page = url.searchParams.get('page')
  const size = url.searchParams.get('size')

  if (page === '0' && size === '10') {
    return HttpResponse.json(BATCHES_API_RESPONSE_MOCK)
  }

  return HttpResponse.json(BATCHES_API_RESPONSE_MOCK)
})

export const batchesReprocessMock = http.get(`${API_BASE_URL_MOCK}/api/v1/batches/reprocess/:batchId`, () => {
  const response = HttpResponse.json(BATCH_REPROCESS_RESPONSE_MOCK)

  return response
})

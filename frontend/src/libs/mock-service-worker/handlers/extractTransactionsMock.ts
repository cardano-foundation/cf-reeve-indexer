import { http, HttpResponse } from 'msw'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

export const EXTRACT_TRANSACTIONS_API_RESPONSE_MOCK = { value2: 'mockValue2' }

export const extractTransactionsMock = http.post(`${API_BASE_URL_MOCK}/api/v1/extraction`, () => {
  return HttpResponse.json(EXTRACT_TRANSACTIONS_API_RESPONSE_MOCK)
})

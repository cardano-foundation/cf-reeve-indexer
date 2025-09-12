import { http, HttpResponse } from 'msw'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

export const TRANSACTION_TYPES_API_RESPONSE_MOCK = { value1: 'mockValue1' }

export const transactionTypesMock = http.get(`${API_BASE_URL_MOCK}/api/v1/transaction-types`, () => {
  return HttpResponse.json(TRANSACTION_TYPES_API_RESPONSE_MOCK)
})

import { http, HttpResponse } from 'msw'

import { TransactionsRejectionReasons } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

export const REJECTION_REASONS_API_RESPONSE_MOCK: TransactionsRejectionReasons[] = [
  TransactionsRejectionReasons.INCORRECT_AMOUNT,
  TransactionsRejectionReasons.INCORRECT_COST_CENTER,
  TransactionsRejectionReasons.INCORRECT_PROJECT,
  TransactionsRejectionReasons.INCORRECT_CURRENCY,
  TransactionsRejectionReasons.INCORRECT_VAT_CODE,
  TransactionsRejectionReasons.REVIEW_PARENT_COST_CENTER,
  TransactionsRejectionReasons.REVIEW_PARENT_PROJECT_CODE
]

export const transactionsRejectionReasonsMock = http.get(`${API_BASE_URL_MOCK}/api/v1/rejection-reasons`, () => {
  return HttpResponse.json(REJECTION_REASONS_API_RESPONSE_MOCK)
})

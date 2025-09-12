import { http, HttpResponse } from 'msw'

import { GET_RECONCILED_TRANSACTIONS_RESPONSE_MOCK, TRIGGER_RECONCILIATION_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/reconciliation.mock.ts'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

export const triggerReconciliationMock = http.post(`${API_BASE_URL_MOCK}/api/v1/reconcile/trigger`, () => {
  const response = HttpResponse.json(TRIGGER_RECONCILIATION_RESPONSE_MOCK)
  return response
})

export const getReconciledTransactionsMock = http.post(`${API_BASE_URL_MOCK}/api/v1/transactions-reconcile`, () => {
  const response = HttpResponse.json(GET_RECONCILED_TRANSACTIONS_RESPONSE_MOCK)
  return response
})

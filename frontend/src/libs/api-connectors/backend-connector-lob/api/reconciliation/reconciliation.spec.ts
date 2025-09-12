import { renderHook } from '@testing-library/react'
import { it } from 'vitest'

import { GET_RECONCILED_TRANSACTIONS_RESPONSE_MOCK, TRIGGER_RECONCILIATION_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/reconciliation.mock.ts'

import { reconciliationApi } from './reconciliationApi'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

describe('reconciliationApi', () => {
  it('triggerReconciliation returns expected data', async ({ expect }) => {
    const { result } = renderHook(() => reconciliationApi(API_BASE_URL_MOCK))
    const response = await result.current.triggerReconciliation({
      organisationId: '1',
      dateFrom: '2023-01-01',
      dateTo: '2023-01-31'
    })

    expect(response).toEqual(TRIGGER_RECONCILIATION_RESPONSE_MOCK)
  })

  it('getReconciledTransactions returns expected data', async ({ expect }) => {
    const { result } = renderHook(() => reconciliationApi(API_BASE_URL_MOCK))
    const response = await result.current.getReconciledTransactions({
      organisationId: '1',
      filter: 'RECONCILED'
    })

    expect(response).toEqual(GET_RECONCILED_TRANSACTIONS_RESPONSE_MOCK)
  })
})

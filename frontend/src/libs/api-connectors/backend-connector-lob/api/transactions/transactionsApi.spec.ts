import { renderHook } from '@testing-library/react'
import { it } from 'vitest'

import { EXTRACT_TRANSACTIONS_API_RESPONSE_MOCK } from 'libs/mock-service-worker/handlers/extractTransactionsMock.ts'
import { TRANSACTION_TYPES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/handlers/transactionTypesMock.ts'

import { transactionsApi } from './transactionsApi'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

describe('transactionsApi', () => {
  it('getTransactionTypes returns expected data', async ({ expect }) => {
    const { result } = renderHook(() => transactionsApi(API_BASE_URL_MOCK))
    const response = await result.current.getTransactionTypes()

    expect(response).toEqual(TRANSACTION_TYPES_API_RESPONSE_MOCK)
  })

  it('extractTransactions returns expected data', async ({ expect }) => {
    const { result } = renderHook(() => transactionsApi(API_BASE_URL_MOCK))
    const response = await result.current.extractTransactions({
      organisationId: '1',
      dateFrom: '2021-01-01',
      dateTo: '2021-01-31',
      transactionType: ['type1', 'type2'],
      transactionNumbers: ['1', '2']
    })

    expect(response).toEqual(EXTRACT_TRANSACTIONS_API_RESPONSE_MOCK)
  })
})

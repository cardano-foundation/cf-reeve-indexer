import { it, vi } from 'vitest'

import { backendLobApi } from './backendLobApi'

vi.mock('libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.ts', () => {
  const mockTransactionsApi = vi.fn()

  return {
    transactionsApi: mockTransactionsApi
  }
})

describe('backendLobApi', () => {
  it('returns transactionsApi', ({ expect }) => {
    const api = backendLobApi()

    expect(api).toHaveProperty('transactionsApi')
  })
})

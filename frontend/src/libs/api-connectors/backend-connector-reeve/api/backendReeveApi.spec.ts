import { it, vi } from 'vitest'

import { backendReeveApi } from './backendReeveApi'

vi.mock('libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.ts', () => {
  const mockTransactionsApi = vi.fn()

  return {
    transactionsApi: mockTransactionsApi
  }
})

describe('backendReeveApi', () => {
  it('returns transactionsApi', ({ expect }) => {
    const api = backendReeveApi()

    expect(api).toHaveProperty('transactionsApi')
  })
})

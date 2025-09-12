import { renderHook } from '@testing-library/react'
import { it } from 'vitest'

import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'

import { batchesApi } from './batchesApi'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

describe('batchesApi', () => {
  it('getBatches returns expected data', async ({ expect }) => {
    const { result } = renderHook(() => batchesApi(API_BASE_URL_MOCK))
    const response = await result.current.getBatches(
      {
        organisationId: '1'
      },
      { page: 0, limit: 10 }
    )

    expect(response).toEqual(BATCHES_API_RESPONSE_MOCK)
  })
})

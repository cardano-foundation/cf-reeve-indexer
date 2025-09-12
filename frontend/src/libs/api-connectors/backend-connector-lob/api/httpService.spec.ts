import { it, vi } from 'vitest'

import { API_BASE_URL_MOCK, API_ENDPOINT_URL_TRANSACTIONS_MOCK, API_PATH_TRANSACTIONS_MOCK, API_REQUEST_PAYLOAD_MOCK } from 'libs/mock-service-worker/mocks/backendLobApi.mock.ts'

import { httpService } from './httpService'

vi.mock('../axios/sendRequest', () => ({ sendRequest: vi.fn().mockResolvedValue({ data: 'mocked data' }) }))

describe('httpService', () => {
  it('get function constructs URL and calls sendRequest with proper http method and url', async ({ expect }) => {
    const { get } = httpService(API_BASE_URL_MOCK)
    const { sendRequest } = await import('../axios/sendRequest')

    await get(API_PATH_TRANSACTIONS_MOCK)

    expect(sendRequest).toHaveBeenCalledWith('GET', API_ENDPOINT_URL_TRANSACTIONS_MOCK, undefined, null, undefined, undefined)
  })

  it('post function constructs URL and calls sendRequest with proper http method, url and payload', async ({ expect }) => {
    const { post } = httpService(API_BASE_URL_MOCK)
    const { sendRequest } = await import('../axios/sendRequest')

    await post(API_PATH_TRANSACTIONS_MOCK, API_REQUEST_PAYLOAD_MOCK)

    expect(sendRequest).toHaveBeenCalledWith('POST', API_ENDPOINT_URL_TRANSACTIONS_MOCK, undefined, API_REQUEST_PAYLOAD_MOCK)
  })

  it('patch function constructs URL and calls sendRequest with proper http method, url and payload', async ({ expect }) => {
    const { patch } = httpService(API_BASE_URL_MOCK)
    const { sendRequest } = await import('../axios/sendRequest')

    await patch(API_PATH_TRANSACTIONS_MOCK, API_REQUEST_PAYLOAD_MOCK)

    expect(sendRequest).toHaveBeenCalledWith('PATCH', API_ENDPOINT_URL_TRANSACTIONS_MOCK, {}, API_REQUEST_PAYLOAD_MOCK)
  })

  it('put function constructs URL and calls sendRequest with proper http method, url and payload', async ({ expect }) => {
    const { put } = httpService(API_BASE_URL_MOCK)
    const { sendRequest } = await import('../axios/sendRequest')

    await put(API_PATH_TRANSACTIONS_MOCK, API_REQUEST_PAYLOAD_MOCK)

    expect(sendRequest).toHaveBeenCalledWith('PUT', API_ENDPOINT_URL_TRANSACTIONS_MOCK, undefined, API_REQUEST_PAYLOAD_MOCK)
  })

  it('remove function constructs URL and calls sendRequest with with proper http method, url and payload', async ({ expect }) => {
    const { remove } = httpService(API_BASE_URL_MOCK)
    const { sendRequest } = await import('../axios/sendRequest')

    await remove(API_PATH_TRANSACTIONS_MOCK, API_REQUEST_PAYLOAD_MOCK)

    expect(sendRequest).toHaveBeenCalledWith('DELETE', API_ENDPOINT_URL_TRANSACTIONS_MOCK, {}, API_REQUEST_PAYLOAD_MOCK)
  })
})

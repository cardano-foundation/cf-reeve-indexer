import axios from 'axios'
import { afterEach, beforeEach, it, vi } from 'vitest'

import { sendRequest } from './sendRequest'

describe('sendRequest', () => {
  const mock = vi.fn().mockImplementation(async () => ({ status: 200 }))
  axios.request = mock

  beforeEach(() => {
    mock.mockClear()
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('calls axios', async ({ expect }) => {
    await sendRequest('GET', 'test')

    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('defaults to the session Bearer token when no Authorization header is passed', async ({ expect }) => {
    sessionStorage.setItem('accessToken', JSON.stringify('test-access-token'))

    await sendRequest('GET', 'test')

    const requestConfig = mock.mock.calls[0][0]
    expect(requestConfig.headers.Authorization).toBe('Bearer test-access-token')
  })

  it('omits the Authorization header when the caller passes an empty string', async ({ expect }) => {
    sessionStorage.setItem('accessToken', JSON.stringify('test-access-token'))

    await sendRequest('GET', 'test', { Authorization: '' })

    const requestConfig = mock.mock.calls[0][0]
    expect(requestConfig.headers.Authorization).toBeUndefined()
  })

  it('passes a custom non-empty Authorization header through unchanged', async ({ expect }) => {
    sessionStorage.setItem('accessToken', JSON.stringify('test-access-token'))

    await sendRequest('GET', 'test', { Authorization: 'Basic abc' })

    const requestConfig = mock.mock.calls[0][0]
    expect(requestConfig.headers.Authorization).toBe('Basic abc')
  })
})

import axios from 'axios'
import { it, vi } from 'vitest'

import { sendRequest } from './sendRequest'

describe('sendRequest', () => {
  const mock = vi.fn().mockImplementation(async () => ({ status: 200 }))
  axios.request = mock

  it('calls axios', async ({ expect }) => {
    await sendRequest('GET', 'test')

    expect(mock).toHaveBeenCalledTimes(1)
  })
})

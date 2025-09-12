import axios from 'axios'
import { describe, it, vi, beforeEach, expect } from 'vitest'

import { setSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/setSessionStorageItem.ts'

import { refreshAccessToken } from './refreshToken.service'

vi.mock('libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts', () => ({
  getSessionStorageItem: vi.fn(() => 'mockRefreshToken')
}))

vi.mock('libs/storage-connectors/session-storage-connector/utils/setSessionStorageItem.ts', () => ({
  setSessionStorageItem: vi.fn()
}))

describe('refreshAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refreshes token and stores new tokens', async () => {
    const mockPost = vi.fn().mockResolvedValue({
      data: {
        access_token: 'newAccessToken',
        refresh_token: 'newRefreshToken'
      }
    })

    axios.post = mockPost as unknown as typeof axios.post

    const result = await refreshAccessToken()

    expect(mockPost).toHaveBeenCalledOnce()
    expect(setSessionStorageItem).toHaveBeenCalledWith('accessToken', 'newAccessToken')
    expect(setSessionStorageItem).toHaveBeenCalledWith('refreshToken', 'newRefreshToken')
    expect(result.access_token).toBe('newAccessToken')
  })
})

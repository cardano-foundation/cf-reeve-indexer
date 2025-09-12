import axios from 'axios'

import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from 'libs/authentication/const/envs.ts'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'
import { setSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/setSessionStorageItem.ts'

export const KEYCLOAK_TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`

export const refreshAccessToken = async () => {
  const refreshToken = getSessionStorageItem<string>('refreshToken')
  if (!refreshToken) throw new Error('Missing refresh token')

  try {
    const response = await axios.post(
      KEYCLOAK_TOKEN_ENDPOINT,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: KEYCLOAK_CLIENT_ID,
        refresh_token: refreshToken
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    setSessionStorageItem('accessToken', response.data.access_token)
    setSessionStorageItem('refreshToken', response.data.refresh_token)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error_description || 'Token refresh failed')
    }
    throw new Error('Unexpected error during token refresh')
  }
}

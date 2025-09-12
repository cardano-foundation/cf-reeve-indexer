import axios from 'axios'

import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from 'libs/authentication/const/envs.ts'
import { setSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/setSessionStorageItem.ts'

export const KEYCLOAK_TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`

export const logIn = async ({ usernameOrEmail, password, otp }: { usernameOrEmail: string; password: string; otp: string }) => {
  try {
    const response = await axios.post(
      KEYCLOAK_TOKEN_ENDPOINT,
      new URLSearchParams({
        grant_type: 'password',
        client_id: KEYCLOAK_CLIENT_ID,
        username: usernameOrEmail,
        password,
        otp
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
      throw new Error(error.response?.data?.error_description)
    }
    throw new Error('Unexpected error occurred')
  }
}

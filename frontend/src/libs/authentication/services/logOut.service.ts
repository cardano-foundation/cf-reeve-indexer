import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from 'libs/authentication/const/envs.ts'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'
import { removeSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/removeSessionStorageItem.ts'

const KEYCLOAK_LOGOUT_ENDPOINT = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`

export const useLogOut = <T = unknown>(state?: T) => {
  const navigate = useNavigate()

  const logOut = async () => {
    try {
      const refreshToken = getSessionStorageItem<string>('refreshToken')

      if (!refreshToken) {
        throw new Error('No refresh token found')
      }

      await axios.post(
        KEYCLOAK_LOGOUT_ENDPOINT,
        new URLSearchParams({
          client_id: KEYCLOAK_CLIENT_ID,
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      removeSessionStorageItem('accessToken')
      removeSessionStorageItem('refreshToken')

      setTimeout(() => {
        navigate('/auth/login', { replace: true, state })
      }, 1000)
    } catch (error) {
      console.error('Logout failed', error)
      throw new Error('Failed to log out')
    }
  }

  return logOut
}

import axios, { AxiosError } from 'axios'

import { KEYCLOAK_TOKEN_ENDPOINT } from 'libs/authentication/services/logIn.service'
import { removeSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/removeSessionStorageItem'
import { ROUTES_V2 } from 'routes'

export const unauthorizedInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        const isLoginRequest = error.response.config.url === KEYCLOAK_TOKEN_ENDPOINT
        const isRefreshRequest = error.response.config.url?.includes('refresh')

        // If it's a login or refresh token request, let it fail normally
        if (isLoginRequest || isRefreshRequest) {
          return Promise.reject(error)
        }

        // Else, token is invalid for a protected route → remove and redirect
        removeSessionStorageItem('accessToken')
        removeSessionStorageItem('refreshToken')

        window.location.replace(ROUTES_V2.AUTH_LOGIN)
      }

      return Promise.reject(error)
    }
  )
}

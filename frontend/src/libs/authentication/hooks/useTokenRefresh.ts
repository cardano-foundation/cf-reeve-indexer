import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getDecodedAccessToken } from 'libs/storage-connectors/session-storage-connector/utils/getDecodedAccessToken'
import { removeSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/removeSessionStorageItem'
import { ROUTES_V2 } from 'routes'

import { refreshAccessToken } from '../services/refreshToken.service'

export const useTokenRefresh = () => {
  const refreshTimeoutRef = useRef<number | null>(null)
  const [startTime] = useState(Date.now())
  const navigate = useNavigate()

  useEffect(() => {
    const scheduleRefresh = () => {
      const decoded = getDecodedAccessToken()

      if (!decoded?.exp) return

      const now = Date.now()
      const expiryTime = decoded.exp * 1000
      const refreshTime = expiryTime - 10000 // Refresh 10s before expiry
      const delay = refreshTime - now

      if (delay <= 0) {
        refreshAccessToken().catch(() => {})
        return
      }

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await refreshAccessToken()
          scheduleRefresh()
        } catch {
          removeSessionStorageItem('accessToken')
          removeSessionStorageItem('refreshToken')

          navigate(ROUTES_V2.AUTH_LOGIN, { replace: true })
        }
      }, delay)
    }

    const initialDelay = setTimeout(() => {
      scheduleRefresh()
    }, 500)

    return () => {
      clearTimeout(initialDelay)
      clearTimeout(refreshTimeoutRef.current!)
    }
  }, [startTime])
}

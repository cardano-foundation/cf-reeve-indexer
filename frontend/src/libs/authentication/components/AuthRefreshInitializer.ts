import { useTokenRefresh } from '../hooks/useTokenRefresh'

export const AuthRefreshInitializer = () => {
  useTokenRefresh()
  return null
}

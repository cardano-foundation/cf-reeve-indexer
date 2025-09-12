import { Navigate, Outlet } from 'react-router-dom'

import { PATHS } from 'routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectPath?: string
  isAllowed: boolean
}

export const ProtectedRoute = ({ children, redirectPath = PATHS.ROOT, isAllowed }: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />
  }

  return children ? children : <Outlet />
}

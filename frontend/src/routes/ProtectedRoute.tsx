import { Navigate } from 'react-router-dom'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'

interface ProtectedRouteProps {
  element: React.ReactNode
}

export const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const { selectedOrganisation } = useLayoutPublicContext()

  if (!selectedOrganisation) {
    return <Navigate to="/" replace />
  }

  return element
}

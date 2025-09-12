import { Navigate } from 'react-router-dom'

import { hasPermission } from './has-permission'
import { Permissions } from './types'

interface RequirePermissionProps {
  resource: keyof Permissions
  children: React.ReactElement
  action: Permissions[keyof Permissions]['action']
}

export const RequirePermission = ({ resource, children, action }: RequirePermissionProps) => {
  if (!hasPermission(resource, action)) {
    return <Navigate to={'/'} replace />
  }
  return children
}

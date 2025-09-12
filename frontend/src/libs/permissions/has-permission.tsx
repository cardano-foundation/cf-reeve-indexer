import { getUser } from 'libs/authentication/user/getUser'

import permissions from './permissions.json'
import { Permissions, RolesWithPermissions } from './types'

export function hasPermission<Resource extends keyof Permissions>(resource: Resource, action: Permissions[Resource]['action'], data?: Permissions[Resource]['dataType']) {
  const user = getUser()

  if (!user) return false

  return user.roles.some((role) => {
    const permission = (permissions as RolesWithPermissions)[role][resource]?.[action]
    if (permission == null) return false

    if (typeof permission === 'boolean') return permission
    return data != null && permission(user, data)
  })
}

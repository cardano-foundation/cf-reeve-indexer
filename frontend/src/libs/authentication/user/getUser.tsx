import { getDecodedAccessToken } from 'libs/storage-connectors/session-storage-connector/utils/getDecodedAccessToken'

import { DecodedAccessToken } from '../types/token.types'
import { User } from '../types/user.types'

export const getUser = () => {
  const token: DecodedAccessToken | null = getDecodedAccessToken()

  if (!token) {
    return null
  }

  const user: User = {
    roles: token.realm_access.roles,
    given_name: token.given_name,
    organisations: token.organisations,
    selectedOrganisation: token.organisations[0]
  }

  return user
}

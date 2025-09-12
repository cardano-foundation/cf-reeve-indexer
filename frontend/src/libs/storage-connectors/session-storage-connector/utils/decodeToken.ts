import { jwtDecode } from 'jwt-decode'

import { DecodedAccessToken } from 'libs/authentication/types/token.types.ts'

export const decodeToken = (token: string) => {
  const decodedToken: DecodedAccessToken = jwtDecode(token)

  return decodedToken
}

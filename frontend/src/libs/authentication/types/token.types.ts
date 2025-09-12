import { JwtPayload } from 'jwt-decode'

import { UserRole } from './user.types'

export interface DecodedAccessToken extends JwtPayload {
  exp: number
  given_name: string
  family_name: string
  name: string
  preferred_username: string
  realm_access: {
    roles: UserRole[]
  }
  organisations: string[]
}

export enum Token {
  ACCESS = 'accessToken',
  REFRESH = 'refreshToken'
}

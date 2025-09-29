import { getDecodedAccessToken } from 'libs/storage-connectors/session-storage-connector/utils/getDecodedAccessToken.ts'

export const useUserDetails = () => {
  const { given_name, family_name } = getDecodedAccessToken() || {}

  const initials = `${given_name?.charAt(0) || ''}${family_name?.charAt(0) || ''}`.toUpperCase()

  return {
    displayName: `${given_name} ${family_name}`,
    initials
  }
}

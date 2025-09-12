import { decodeToken } from 'libs/storage-connectors/session-storage-connector/utils/decodeToken.ts'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'

export const getDecodedAccessToken = () => {
  const accessToken = getSessionStorageItem<string>('accessToken')

  if (!accessToken) return null

  try {
    const decoded = decodeToken(accessToken)
    return decoded
  } catch (error) {
    return null
  }
}

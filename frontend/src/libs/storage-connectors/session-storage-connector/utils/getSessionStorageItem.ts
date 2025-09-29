export const getSessionStorageItem = <T = unknown>(key: string): T | null => {
  try {
    const item = sessionStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : null
  } catch (error) {
    console.error(`Error getting item from sessionStorage: ${error}`)

    return null
  }
}

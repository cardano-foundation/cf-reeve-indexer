export const getLocalStorageItem = <T = unknown>(key: string) => {
  try {
    const item = localStorage.getItem(key)

    return item ? (JSON.parse(item) ? (JSON.parse(item) as T) : item) : null
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`)

    return null
  }
}

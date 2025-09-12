export const removeSessionStorageItem = (key: string) => {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing item from sessionStorage: ${error}`)
  }
}

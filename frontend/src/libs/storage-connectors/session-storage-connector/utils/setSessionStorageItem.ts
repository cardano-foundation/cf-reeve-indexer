export const setSessionStorageItem = (key: string, value: unknown) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting item in sessionStorage: ${error}`)
  }
}

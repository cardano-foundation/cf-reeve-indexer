export const setLocalStorageItem = <T = unknown>(key: string, value: T) => {
  try {
    return localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`)

    return null
  }
}

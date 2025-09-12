import { useEffect, useState } from 'react'

import { getLocalStorageItem } from 'libs/storage-connectors/local-storage-connector/utils/getLocalStorageItem.ts'

export const useLocalStorage = <T = unknown>(key: string) => {
  const [storage, setStorage] = useState<T | null>(null)

  useEffect(() => {
    const data = getLocalStorageItem<T>(key)

    if (data) {
      setStorage(data as T)
    }
  }, [key, setStorage])

  return storage
}

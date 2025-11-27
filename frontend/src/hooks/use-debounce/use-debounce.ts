import { debounce } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

export const useDebounce = <T = unknown>(value: T, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T | null>(null)

  const debounced = useMemo(() => debounce((value: T) => setDebouncedValue(value), delay), [delay])

  useEffect(() => {
    debounced(value)

    return () => {
      debounced.cancel()
    }
  }, [debounced, value, delay])

  return debouncedValue
}

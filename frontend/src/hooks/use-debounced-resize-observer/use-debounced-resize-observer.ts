import { throttle } from 'lodash'
import { useLayoutEffect, useMemo, type RefObject } from 'react'

export const useDebouncedResizeObserver = (ref: RefObject<HTMLElement>, callback: () => void, delay = 50) => {
  const debouncedCallback = useMemo(() => throttle(callback, delay), [callback, delay])

  useLayoutEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver(debouncedCallback)

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [delay, ref, debouncedCallback])
}

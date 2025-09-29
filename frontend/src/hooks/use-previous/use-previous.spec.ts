import { renderHook } from '@testing-library/react'
import { it } from 'vitest'

import { usePrevious } from 'hooks/use-previous/use-previous'

describe('usePrevious', () => {
  it('should return the initial value', () => {
    const { result } = renderHook(() => usePrevious(0))

    expect(result.current).toBeNull()
  })

  it('should return the previous value', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 }
    })

    expect(result.current).toBeNull()

    rerender({ value: 1 })

    expect(result.current).toBe(0)
  })
})

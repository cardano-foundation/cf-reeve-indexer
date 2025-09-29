import { act, renderHook } from '@testing-library/react'
import { it } from 'vitest'

import { usePagination } from './usePagination'

describe('usePagination', () => {
  it('should handle page change', async () => {
    const { result } = renderHook(usePagination)

    await act(async () => {
      result.current.handleChangePage(null, 2)
    })

    expect(result.current.page).toEqual(2)
  })

  it('should handle rows per page change', async () => {
    const { result } = renderHook(usePagination)

    await act(async () => {
      result.current.handleChangeRowsPerPage({ target: { value: '20' } } as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.rowsPerPage).toEqual(20)
  })

  it('should reset page when rows per page change', async () => {
    const { result } = renderHook(usePagination)

    await act(async () => {
      result.current.handleChangeRowsPerPage({ target: { value: '20' } } as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.page).toEqual(0)
    expect(result.current.rowsPerPage).toEqual(20)
  })
})

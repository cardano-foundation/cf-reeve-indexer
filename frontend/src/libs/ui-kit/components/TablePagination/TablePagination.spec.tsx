import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

import { TablePagination, TablePaginationProps } from 'libs/ui-kit/components/TablePagination/TablePagination.component.tsx'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

const TablePaginationWithProviders = ({ onPageChange = vi.fn() }: { onPageChange?: TablePaginationProps['onPageChange'] } = {}) => {
  return (
    <TestWrapper>
      <TablePagination count={100} page={1} onPageChange={onPageChange} rowsPerPage={10} onRowsPerPageChange={vi.fn()} />
    </TestWrapper>
  )
}

describe('TablePagination', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders the TablePagination component with correct elements', () => {
    render(<TablePaginationWithProviders />)

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('handles page change correctly', () => {
    const handleChangePageMock = vi.fn()
    render(<TablePaginationWithProviders onPageChange={handleChangePageMock} />)

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(handleChangePageMock).toHaveBeenCalledWith(expect.anything(), 2)
  })
})

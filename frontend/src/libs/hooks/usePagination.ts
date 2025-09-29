import { useState } from 'react'

export const PAGINATION_CONFIG = {
  PAGE: 0,
  ROWS_PER_PAGE: 10
}

export const usePagination = () => {
  const [page, setPage] = useState<number>(PAGINATION_CONFIG.PAGE)
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_CONFIG.ROWS_PER_PAGE)

  const handlePagination = (newPage: number, rowsPerPage: number) => {
    setPage(newPage)
    setRowsPerPage(rowsPerPage)
  }

  return { page, rowsPerPage, handlePagination }
}

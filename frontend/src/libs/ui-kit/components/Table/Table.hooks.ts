import { ChangeEvent, MouseEvent, ReactNode, useState } from 'react'

import { InitialState, TableColumnsDef, TableRowModel } from 'libs/ui-kit/components/Table/Table.types.ts'
import { sortAllValues } from 'libs/ui-kit/components/Table/Table.utils.ts'

interface TableSortingState<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> {
  columns: TableColumnsDef<T>
  initialState?: InitialState<T, K>
  rows?: T[]
  sortingMode: 'client' | 'server'
}

interface TableSortingHandlers<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> {
  onSortChange?: (field: K, order: 'asc' | 'desc') => void
}

export const useTableSorting = <T extends TableRowModel = TableRowModel, K extends keyof T = keyof T>(state: TableSortingState<T>, handlers: TableSortingHandlers<T, K>) => {
  const { columns, initialState, rows, sortingMode } = state
  const { onSortChange } = handlers

  const [order, setOrder] = useState<'asc' | 'desc'>(initialState?.sorting?.sortModel[0]?.sort || 'desc')
  const [orderBy, setOrderBy] = useState<keyof T | null>(initialState?.sorting?.sortModel[0]?.field || null)

  const sortedRows = sortingMode === 'client' ? (orderBy ? sortAllValues(rows ?? [...(rows ?? [])], columns, orderBy, order) : rows) : rows

  const handleSort = (field: K) => {
    const isAscending = orderBy === field && order === 'asc'
    const newOrder = isAscending ? 'desc' : 'asc'

    setOrder(newOrder)
    setOrderBy(field)

    if (sortingMode === 'server') {
      onSortChange?.(field, newOrder)
    }
  }

  return { order, orderBy, sortedRows, handleSort }
}

interface TablePaginationState<T extends TableRowModel = TableRowModel> {
  pageSize: number
  paginationMode: 'client' | 'server'
  sortedRows?: T[]
  hidePagination?: boolean
}

interface TablePaginationHandlers {
  onPagination?: (page: number, rowsPerPage: number) => void
}

export const useTablePagination = <T extends TableRowModel = TableRowModel>(state: TablePaginationState<T>, handlers: TablePaginationHandlers) => {
  const { pageSize, paginationMode, sortedRows, hidePagination } = state
  const { onPagination } = handlers

  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(pageSize)

  const paginatedRows = !hidePagination ? (paginationMode === 'client' ? (sortedRows ?? []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : sortedRows) : sortedRows

  const handleChangePage = (_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage)

    if (paginationMode === 'server') {
      onPagination?.(newPage, rowsPerPage)
    }
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newRowsPerPage = parseInt((event.target as HTMLInputElement).value, 10)

    setRowsPerPage(newRowsPerPage)
    setPage(0)

    if (paginationMode === 'server') {
      onPagination?.(0, newRowsPerPage)
    }
  }

  return { paginatedRows, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage }
}

interface TableRowCollapsableState<T extends TableRowModel = TableRowModel> {
  paginatedRows?: T[]
}

interface TableRowCollapsableHandlers<T extends TableRowModel = TableRowModel> {
  collapsableRow?: (row: T) => ReactNode
  getRowId?: (row: T) => string
}

export const useTableRowCollapsable = <T extends TableRowModel = TableRowModel>(state: TableRowCollapsableState<T>, handlers: TableRowCollapsableHandlers<T> = {}) => {
  const { paginatedRows } = state
  const { collapsableRow, getRowId } = handlers

  const [expandedRows, setExpandedRows] = useState<number[]>([])

  const collapsableRowsCount = (paginatedRows ?? []).filter((row) => collapsableRow?.(row)).length

  const hasAnyCollapsableRows = (paginatedRows ?? []).some((row) => collapsableRow?.(row))
  const isAllExpanded = expandedRows.length > 0 && expandedRows.length === collapsableRowsCount

  const handleCollapse = (id: number) => {
    const newCollapse = expandedRows.includes(id) ? expandedRows.filter((expandedId) => expandedId !== id) : [...expandedRows, id]

    setExpandedRows(newCollapse)
  }

  const handleCollapseAll = () => {
    const newCollapse =
      expandedRows.length !== collapsableRowsCount
        ? (paginatedRows ?? []).map((row) => (collapsableRow && collapsableRow(row) ? (getRowId ? getRowId(row) : row.id) : null)).filter(Boolean)
        : []

    setExpandedRows(newCollapse)
  }

  return { expandedRows, handleCollapse, handleCollapseAll, hasAnyCollapsableRows, isAllExpanded }
}

interface TableRowSelectionState<T extends TableRowModel = TableRowModel> {
  rows: T[]
}

interface TableRowSelectionHandlers {
  onSelectionChange?: (selectedIds: string[]) => void
}

export const useTableRowSelection = <T extends TableRowModel = TableRowModel>(state: TableRowSelectionState<T>, handlers: TableRowSelectionHandlers) => {
  const { rows } = state
  const { onSelectionChange } = handlers

  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const isChecked = rows.length !== 0 && selectedRows.length === rows.length
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < rows.length

  const handleSelect = (id: string) => {
    const newSelected = selectedRows.includes(id) ? selectedRows.filter((selectedId) => selectedId !== id) : [...selectedRows, id]

    setSelectedRows(newSelected)
    onSelectionChange?.(newSelected)
  }

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    const newSelected = event.target.checked ? rows.map((row) => row.id) : []

    setSelectedRows(newSelected)
    onSelectionChange?.(newSelected)
  }

  return { selectedRows, handleSelect, handleSelectAll, isChecked, isIndeterminate }
}

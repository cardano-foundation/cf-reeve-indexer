/* eslint-disable @typescript-eslint/no-explicit-any */

import { TableProps as TablePropsMUI } from '@mui/material/Table'
import { ReactNode } from 'react'

export type GeneralCommonField = 'actions'

export type TransactionsCommonField = 'transactionsCount'

export type CommonField = TransactionsCommonField | GeneralCommonField

export type TableRowModel<T extends Record<string, any> = Record<string, any>> = T

export interface SortState<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> {
  field: K
  sort: 'asc' | 'desc'
}

export interface SortInitialState<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> {
  sortModel: SortState<T, K>[]
}

export interface InitialState<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> {
  sorting: SortInitialState<T, K>
}

export interface TableRowInternalState {
  isRowChecked?: boolean
  isRowExpanded?: boolean
}

export interface TableColDef<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> {
  field: K | CommonField
  headerName: string
  align?: 'left' | 'right' | 'center'
  headerAlign?: 'left' | 'right' | 'center'
  sortable?: boolean
  sticky?: boolean
  width?: string | number
  renderCell?: (row: T, rowState: TableRowInternalState) => ReactNode
  valueGetter?: (value: T[K], row: T) => any
  // TODO: update type to be conditional based on valueGetter return type
  valueFormatter?: (value: T[K]) => string
}

export type TableColumnsDef<T extends TableRowModel = TableRowModel> = { [K in keyof T]: TableColDef<T, K> }[keyof T][]

export interface TableProps<T extends TableRowModel = TableRowModel, K extends keyof T = keyof T> extends TablePropsMUI {
  initialState?: InitialState<T, K>
  columns: TableColumnsDef<T>
  noRowsAction?: ReactNode
  noRowsHint?: string
  noRowsMessage?: string
  rows?: T[]
  pageSize?: number
  paginationMode?: 'client' | 'server'
  sortingMode?: 'client' | 'server'
  totalRows?: number
  collapsableRow?: (row: T, field?: K, order?: 'asc' | 'desc') => ReactNode
  getRowId?: (row: T) => string
  onSelectionChange?: (selectedIds: string[]) => void
  onPagination?: (page: number, rowsPerPage: number) => void
  onSortChange?: (field: K, order: 'asc' | 'desc') => void
  checkboxSelection?: boolean
  hasFiltersSelected?: boolean
  hidePagination?: boolean
  isLoading: boolean
}

export interface ToolbarProps {
  children: ReactNode
}

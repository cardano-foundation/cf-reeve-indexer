import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Paper from '@mui/material/Paper'
import TableBody from '@mui/material/TableBody'
import { TableContainerProps as TableContainerMUIProps } from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import { ArrowDown2, ArrowUp2, Box2, FilterRemove } from 'iconsax-react'
import { Fragment, ReactNode } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'
import { Checkbox } from 'libs/ui-kit/components/Checkbox/Checkbox.component.tsx'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { useTablePagination, useTableRowCollapsable, useTableRowSelection, useTableSorting } from 'libs/ui-kit/components/Table/Table.hooks.ts'
import {
  ButtonSortIconStyled,
  IconArrowDownStyled,
  IconArrowUpStyled,
  TableBodyCellCollapsableStyled,
  TableBodyCellCollapseStyled,
  TableBodyCellEmptyStyled,
  TableBodyCellSelectionStyled,
  TableBodyCellStyled,
  TableContainerRStyled,
  TableContainerStyled,
  TableHeadCellCollapseStyled,
  TableHeadCellSelectionStyled,
  TableHeadCellStyled,
  TableRowBodyStyled,
  TableRowHeadStyled,
  TableSortLabelStyled,
  TableStyled
} from 'libs/ui-kit/components/Table/Table.styles.tsx'
import { TableProps, TableRowModel, ToolbarProps } from 'libs/ui-kit/components/Table/Table.types.ts'
import { TablePagination } from 'libs/ui-kit/components/TablePagination/TablePagination.component.tsx'

export const Table = <T extends TableRowModel = TableRowModel>({
  initialState,
  columns,
  noRowsAction,
  noRowsHint,
  noRowsMessage,
  rows = [],
  pageSize = 10,
  paginationMode = 'client',
  sortingMode = 'client',
  totalRows,
  collapsableRow,
  getRowId,
  onPagination,
  onSelectionChange,
  onSortChange,
  checkboxSelection = false,
  hasFiltersSelected,
  hidePagination = false,
  isLoading,
  ...props
}: TableProps<T>) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { selectedRows, handleSelect, handleSelectAll, isChecked, isIndeterminate } = useTableRowSelection({ rows }, { onSelectionChange })
  const { order, orderBy, sortedRows, handleSort } = useTableSorting({ columns, initialState, rows, sortingMode }, { onSortChange })
  const { page, rowsPerPage, paginatedRows, handleChangePage, handleChangeRowsPerPage } = useTablePagination(
    { pageSize, paginationMode, sortedRows, hidePagination },
    { onPagination }
  )
  const { expandedRows, handleCollapse, handleCollapseAll, hasAnyCollapsableRows, isAllExpanded } = useTableRowCollapsable({ paginatedRows }, { collapsableRow, getRowId })

  const colspan = columns.length + (checkboxSelection ? 1 : 0) + 1

  const hasRows = paginatedRows && paginatedRows.length > 0

  return (
    <>
      <TableContainerRStyled>
        <TableStyled aria-label={props['aria-label']} size="medium" stickyHeader {...props}>
          <TableHead>
            <TableRowHeadStyled>
              {checkboxSelection && (
                <TableHeadCellSelectionStyled align="center" width="72px">
                  <Checkbox indeterminate={isIndeterminate} checked={isChecked} onChange={handleSelectAll} disabled={!hasRows} />
                </TableHeadCellSelectionStyled>
              )}
              {collapsableRow && (
                <TableHeadCellCollapseStyled align="center" width="72px">
                  <ButtonIcon
                    aria-label={isAllExpanded ? 'collapse all rows' : 'expand all rows'}
                    size="small"
                    onClick={handleCollapseAll}
                    disabled={!hasAnyCollapsableRows || !hasRows}
                  >
                    {isAllExpanded ? <ArrowUp2 size={20} /> : <ArrowDown2 size={20} />}
                  </ButtonIcon>
                </TableHeadCellCollapseStyled>
              )}
              {columns.map((column) => (
                <TableHeadCellStyled key={column.field.toString()} align={column.headerAlign} width={column.width} $isSticky={column.sticky}>
                  {column.sortable ? (
                    <TableSortLabelStyled
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : 'asc'}
                      IconComponent={() => (
                        <ButtonSortIconStyled>
                          {orderBy === column.field ? order === 'asc' ? <IconArrowUpStyled /> : <IconArrowDownStyled /> : <IconArrowUpStyled />}
                        </ButtonSortIconStyled>
                      )}
                      onClick={() => handleSort(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabelStyled>
                  ) : (
                    column.headerName
                  )}
                </TableHeadCellStyled>
              ))}
            </TableRowHeadStyled>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRowBodyStyled sx={{ width: '100%', height: '35vh' }}>
                <TableBodyCellEmptyStyled colSpan={colspan}>
                  <Box sx={{ position: 'sticky', left: '50%' }}>
                    <EmptyStateTable asset={<LoaderCentered size={56} />} hint={t({ id: 'loadingHint' })} message={t({ id: 'loadingMessage' })} />
                  </Box>
                </TableBodyCellEmptyStyled>
              </TableRowBodyStyled>
            ) : hasRows ? (
              paginatedRows.map((row) => {
                const rowId = getRowId ? getRowId(row) : row.id

                const hasCollapsableRow = Boolean(collapsableRow)
                const hasCollapsableRowRender = Boolean(collapsableRow && collapsableRow(row))
                const isRowChecked = selectedRows.includes(rowId)
                const isRowExpanded = expandedRows.includes(rowId) && hasCollapsableRowRender

                return (
                  <Fragment key={rowId}>
                    <TableRowBodyStyled $hasCollapsableRows={hasCollapsableRowRender}>
                      {checkboxSelection && (
                        <TableBodyCellSelectionStyled align="center" width="72px" $isExpanded={isRowExpanded}>
                          <Checkbox checked={isRowChecked} onChange={() => handleSelect(rowId)} />
                        </TableBodyCellSelectionStyled>
                      )}
                      {hasCollapsableRow && (
                        <TableBodyCellCollapseStyled align="center" width="72px" $isExpanded={isRowExpanded}>
                          {hasCollapsableRowRender && (
                            <ButtonIcon aria-label={isRowExpanded ? 'collapse row' : 'expand row'} size="small" onClick={() => handleCollapse(rowId)}>
                              {isRowExpanded ? <ArrowUp2 size={20} /> : <ArrowDown2 size={20} />}
                            </ButtonIcon>
                          )}
                        </TableBodyCellCollapseStyled>
                      )}
                      {columns.map((column) => (
                        <TableBodyCellStyled key={column.field.toString()} align={column.align} $isExpanded={isRowExpanded} $isSticky={column.sticky}>
                          {column.renderCell ? (
                            column.renderCell(row, { isRowChecked, isRowExpanded })
                          ) : column.valueGetter ? (
                            <CellText
                              value={column.valueFormatter ? column.valueFormatter(column.valueGetter(row[column.field], row)) : column.valueGetter(row[column.field], row)}
                              isTextWrapped
                            />
                          ) : column.valueFormatter ? (
                            <CellText value={column.valueFormatter(row[column.field])} isTextWrapped />
                          ) : (
                            <CellText value={row[column.field]} isTextWrapped />
                          )}
                        </TableBodyCellStyled>
                      ))}
                    </TableRowBodyStyled>
                    {hasCollapsableRowRender && (
                      <TableRowBodyStyled $hasCollapsableRows={hasCollapsableRowRender}>
                        <TableBodyCellCollapsableStyled colSpan={colspan} $isExpanded={isRowExpanded}>
                          <Collapse in={isRowExpanded} timeout="auto" unmountOnExit>
                            {collapsableRow?.(row, orderBy || '', order)}
                          </Collapse>
                        </TableBodyCellCollapsableStyled>
                      </TableRowBodyStyled>
                    )}
                  </Fragment>
                )
              })
            ) : (
              <TableRowBodyStyled sx={{ width: '100%', height: '35vh' }}>
                <TableBodyCellEmptyStyled colSpan={colspan}>
                  <Box sx={{ position: 'sticky', left: '50%' }}>
                    {hasFiltersSelected ? (
                      <EmptyStateTable
                        asset={<FilterRemove color={theme.palette.action.disabled} size={56} variant="Outline" />}
                        hint={t({ id: 'noResultsHint' })}
                        message={t({ id: 'noResultsMessage' })}
                      />
                    ) : noRowsMessage ? (
                      <EmptyStateTable
                        action={noRowsAction}
                        asset={<Box2 color={theme.palette.action.disabled} size={56} variant="Outline" />}
                        hint={noRowsHint}
                        message={noRowsMessage}
                      />
                    ) : null}
                  </Box>
                </TableBodyCellEmptyStyled>
              </TableRowBodyStyled>
            )}
          </TableBody>
        </TableStyled>
      </TableContainerRStyled>
      {!hidePagination ? (
        !isLoading && hasRows ? (
          <TablePagination
            component={Box}
            count={paginationMode === 'client' ? rows?.length || 0 : totalRows || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        ) : null
      ) : null}
    </>
  )
}

const Toolbar = ({ children }: ToolbarProps) => {
  const theme = useTheme()

  return (
    <Box borderBottom={`1px solid ${theme.palette.divider}`} display="flex" gap={4} p={2}>
      {children}
    </Box>
  )
}

interface TableContainerProps extends TableContainerMUIProps {
  children: ReactNode
}

export const TableContainer = ({ children, ...props }: TableContainerProps) => {
  return (
    <TableContainerStyled component={Paper} display="flex" flexDirection="column" maxHeight="100%" width="100%" overflow="hidden" {...props}>
      {children}
    </TableContainerStyled>
  )
}

TableContainer.Table = Table
TableContainer.Toolbar = Toolbar

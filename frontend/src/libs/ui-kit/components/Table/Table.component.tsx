import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Paper from '@mui/material/Paper'
import TableBody from '@mui/material/TableBody'
import { TableContainerProps as TableContainerMUIProps } from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import { ArrowDown2, ArrowUp2, Box2, FilterRemove, GridEdit } from 'iconsax-react'
import { Fragment, ReactNode, useState } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'
import { Checkbox } from 'libs/ui-kit/components/Checkbox/Checkbox.component.tsx'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { useTablePagination, useTableRowCollapsable, useTableRowSelection, useTableSorting, useTableColumnVisibility } from 'libs/ui-kit/components/Table/Table.hooks.ts'
import {
  ButtonSortIconStyled,
  IconArrowDownStyled,
  IconArrowUpStyled,
  MenuItemStyled,
  MenuStyled,
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
  alwaysExpanded,
  getRowId,
  onPagination,
  onSelectionChange,
  onSortChange,
  checkboxSelection = false,
  hasFiltersSelected,
  hidePagination = false,
  isLoading,
  fillAvailableWidth = false,
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

  const { visibleColumns, hideableColumns, hasHideableColumns, hiddenFields, toggleColumn } = useTableColumnVisibility({ columns, initialState })

  const parseWeight = (width?: string | number) => (typeof width === 'number' ? width : parseFloat(width || '0') || 0)

  const totalWeight = visibleColumns.reduce((sum, column) => sum + parseWeight(column.width), 0)

  const reservedWidth = (checkboxSelection ? 72 : 0) + (collapsableRow && !alwaysExpanded ? 48 : 0) + (hasHideableColumns ? 64 : 0)

  const getColumnWidth = (column: (typeof visibleColumns)[number]) => {
    if (!fillAvailableWidth) return undefined

    const weight = parseWeight(column.width)

    return weight && totalWeight ? `calc((100% - ${reservedWidth}px) * ${weight / totalWeight})` : column.width
  }

  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null)

  const colspan = visibleColumns.length + (checkboxSelection ? 1 : 0) + (hasHideableColumns ? 1 : 0) + 1

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
              {collapsableRow && !alwaysExpanded && (
                <TableHeadCellCollapseStyled align="center" width={fillAvailableWidth ? '48px' : '72px'}>
                  <ButtonIcon
                    aria-label={isAllExpanded ? t({ id: 'collapseAllRows' }) : t({ id: 'expandAllRows' })}
                    size="small"
                    onClick={handleCollapseAll}
                    disabled={!hasAnyCollapsableRows || !hasRows}
                  >
                    {isAllExpanded ? <ArrowUp2 size={20} /> : <ArrowDown2 size={20} />}
                  </ButtonIcon>
                </TableHeadCellCollapseStyled>
              )}
              {visibleColumns.map((column) => (
                <TableHeadCellStyled
                  key={column.field.toString()}
                  align={column.headerAlign}
                  width={fillAvailableWidth ? undefined : column.width}
                  sx={fillAvailableWidth ? { width: getColumnWidth(column) } : undefined}
                  $isSticky={column.sticky}
                >
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
              {hasHideableColumns && (
                <TableHeadCellStyled align="center" width="64px" $isSticky>
                  <ButtonIcon aria-label={t({ id: 'manageColumns' })} size="small" onClick={(event) => setColumnMenuAnchor(event.currentTarget)}>
                    <GridEdit size={20} />
                  </ButtonIcon>
                  <MenuStyled anchorEl={columnMenuAnchor} open={Boolean(columnMenuAnchor)} onClose={() => setColumnMenuAnchor(null)}>
                    {hideableColumns.map((column) => (
                      <MenuItemStyled key={column.field.toString()} disableRipple onClick={() => toggleColumn(column.field.toString())}>
                        <Checkbox checked={!hiddenFields.includes(column.field.toString())} />
                        {column.headerName}
                      </MenuItemStyled>
                    ))}
                  </MenuStyled>
                </TableHeadCellStyled>
              )}
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
                const isRowExpanded = (alwaysExpanded || expandedRows.includes(rowId)) && hasCollapsableRowRender

                return (
                  <Fragment key={rowId}>
                    <TableRowBodyStyled $hasCollapsableRows={hasCollapsableRowRender}>
                      {checkboxSelection && (
                        <TableBodyCellSelectionStyled align="center" width="72px" $isExpanded={isRowExpanded}>
                          <Checkbox checked={isRowChecked} onChange={() => handleSelect(rowId)} />
                        </TableBodyCellSelectionStyled>
                      )}
                      {hasCollapsableRow && !alwaysExpanded && (
                        <TableBodyCellCollapseStyled align="center" width={fillAvailableWidth ? '48px' : '72px'} $isExpanded={isRowExpanded}>
                          {hasCollapsableRowRender && (
                            <ButtonIcon aria-label={isRowExpanded ? t({ id: 'collapseRow' }) : t({ id: 'expandRow' })} size="small" onClick={() => handleCollapse(rowId)}>
                              {isRowExpanded ? <ArrowUp2 size={20} /> : <ArrowDown2 size={20} />}
                            </ButtonIcon>
                          )}
                        </TableBodyCellCollapseStyled>
                      )}
                      {visibleColumns.map((column) => (
                        <TableBodyCellStyled
                          key={column.field.toString()}
                          align={column.align}
                          $isExpanded={isRowExpanded}
                          $isSticky={column.sticky}
                          width={fillAvailableWidth ? undefined : column.width}
                          sx={fillAvailableWidth ? { width: getColumnWidth(column) } : undefined}
                        >
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
                      {hasHideableColumns && <TableBodyCellStyled align="center" width="64px" $isExpanded={isRowExpanded} $isSticky />}
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

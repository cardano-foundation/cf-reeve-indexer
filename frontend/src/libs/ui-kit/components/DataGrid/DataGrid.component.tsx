import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { DataGridProps as DataGridPropsMUI } from '@mui/x-data-grid'
import { Box2, FilterRemove } from 'iconsax-react'
import { ReactNode } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'
import { Checkbox } from 'libs/ui-kit/components/Checkbox/Checkbox.component.tsx'
import {
  CellStyled,
  ColumnMenuHideIconStyled,
  ColumnMenuIconStyled,
  ColumnMenuManageColumnsIconStyled,
  ColumnMenuStyled,
  ColumnSortAscedingIconStyled,
  ColumnSortDescendingIconStyled,
  ColumnsPanelStyled,
  DataGridStyled,
  FooterStyled,
  RowStyled
} from 'libs/ui-kit/components/DataGrid/DataGrid.styles.tsx'
import { getTogglableColumns } from 'libs/ui-kit/components/DataGrid/DataGrid.utils.ts'
import { DataGridPagination } from 'libs/ui-kit/components/DataGridPagination/DataGridPagination.component.tsx'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { Popper } from 'libs/ui-kit/components/Popper/Popper.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

const DATA_GRID_VIRTUALIZATION_OFF = import.meta.env.VITE_DATA_GRID_VIRTUALIZATION_OFF

const isDataGridVirtualizationOff = DATA_GRID_VIRTUALIZATION_OFF === 'true'

interface DataGridProps extends Omit<DataGridPropsMUI, 'loading'> {
  noRowsAction?: ReactNode
  noRowsHint?: string
  noRowsMessage?: string
  hasFiltersSelected?: boolean
  isLoading: boolean
}

export const DataGrid = ({ initialState, columns, rows, noRowsHint, noRowsAction, noRowsMessage, slotProps, hasFiltersSelected, isLoading, ...props }: DataGridProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const minHeight = !rows?.length ? 'calc(35vh + 3rem)' : '0'

  const transformedColumns: typeof columns = columns.map((column) => ({
    ...column,
    minWidth: column.minWidth || column.width || 192,
    renderCell: !column.renderCell
      ? ({ api, row, value }) => {
          const formattedValue = column.valueFormatter ? column.valueFormatter(value, row, column, api) : value

          return <CellText value={formattedValue} />
        }
      : column.renderCell
  }))

  const hasRows = rows && rows.length > 0

  return (
    <Box display="flex" flexDirection="column" width="100%" maxHeight="100%" minHeight={minHeight}>
      <DataGridStyled
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          },
          ...initialState
        }}
        columns={transformedColumns}
        columnHeaderHeight={48}
        rowHeight={52}
        rows={rows}
        slotProps={{
          baseIconButton: { size: 'large' },
          columnsManagement: {
            getTogglableColumns,
            disableResetButton: true,
            searchPredicate: undefined
          },
          ...slotProps
        }}
        loading={isLoading && !rows?.length}
        slots={{
          basePopper: Popper,
          baseTooltip: Tooltip,
          cell: CellStyled,
          baseCheckbox: Checkbox,
          columnMenuIcon: ColumnMenuIconStyled,
          columnMenuHideIcon: ColumnMenuHideIconStyled,
          columnMenuManageColumnsIcon: ColumnMenuManageColumnsIconStyled,
          columnSortedAscendingIcon: ColumnSortAscedingIconStyled,
          columnSortedDescendingIcon: ColumnSortDescendingIconStyled,
          columnMenu: (props) => <ColumnMenuStyled slots={{ columnMenuSortItem: null }} {...props} />,
          columnsPanel: ColumnsPanelStyled,
          footer: FooterStyled,
          loadingOverlay: () => <EmptyStateTable asset={<LoaderCentered size={56} />} hint={t({ id: 'loadingHint' })} message={t({ id: 'loadingMessage' })} />,
          noRowsOverlay: hasFiltersSelected
            ? () => (
                <EmptyStateTable
                  asset={<FilterRemove color={theme.palette.action.disabled} size={56} variant="Outline" />}
                  hint={t({ id: 'noResultsHint' })}
                  message={t({ id: 'noResultsMessage' })}
                />
              )
            : noRowsMessage
              ? () => (
                  <EmptyStateTable
                    action={noRowsAction}
                    asset={<Box2 color={theme.palette.action.disabled} size={56} variant="Outline" />}
                    hint={noRowsHint}
                    message={noRowsMessage}
                  />
                )
              : undefined,
          pagination: DataGridPagination,
          row: RowStyled
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationMode="client"
        sortingMode="client"
        sortingOrder={['asc', 'desc']}
        disableColumnFilter
        disableMultipleRowSelection
        disableRowSelectionOnClick
        disableVirtualization={isDataGridVirtualizationOff}
        hideFooter={!hasRows}
        {...props}
      />
    </Box>
  )
}

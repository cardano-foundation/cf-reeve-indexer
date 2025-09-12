import { DataGrid, GridCell, GridColumnMenu, GridColumnsPanel, GridFooter, GridRow } from '@mui/x-data-grid'
import { ArrowDown, ArrowUp, EyeSlash, GridEdit } from 'iconsax-react'
import { styled } from 'styled-components'

import { MoreVerticalIcon } from 'libs/ui-kit/components/MoreVerticalIcon/MoreVerticalIcon.component.tsx'

export const ColumnMenuIconStyled = styled(MoreVerticalIcon)``

export const ColumnMenuHideIconStyled = styled(() => <EyeSlash size={20} variant="Outline" />)``

export const ColumnMenuManageColumnsIconStyled = styled(() => <GridEdit size={20} variant="Outline" />)``

export const ColumnSortAscedingIconStyled = styled(() => <ArrowUp size={20} variant="Outline" />)``

export const ColumnSortDescendingIconStyled = styled(() => <ArrowDown size={20} variant="Outline" />)``

export const ColumnMenuStyled = styled(GridColumnMenu)`
  && {
    min-width: unset;
  }
`

export const ColumnsPanelStyled = styled(GridColumnsPanel)`
  && {
    & .MuiDataGrid-columnsManagementHeader {
      display: none;
    }

    & .MuiDataGrid-columnsManagement {
      padding: ${({ theme }) => theme.spacing(1, 0)};
    }

    & .MuiDataGrid-columnsManagementFooter {
      padding: ${({ theme }) => theme.spacing(1, 0)};
    }

    & .MuiFormControlLabel-root {
      width: 100%;
      margin: 0;
      padding: ${({ theme }) => theme.spacing(0.75, 2)};
      gap: ${({ theme }) => theme.spacing(0.25)};
    }
  }
`

export const RowStyled = styled(GridRow)`
  && {
    &.MuiDataGrid-row {
      &:last-of-type .MuiDataGrid-cell {
        border: none;
      }

      &:hover {
        background: ${({ theme }) => theme.palette.background.default};
      }
    }
  }
`

export const CellStyled = styled(GridCell)`
  && {
    &.MuiDataGrid-cell {
      display: flex;
      padding: ${({ theme }) => theme.spacing(0.25, 2)};
      align-items: center;
      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
      line-height: 1.5;

      &:focus {
        outline: none;
      }
    }
  }
`

export const FooterStyled = styled(GridFooter)`
  && {
    &.MuiDataGrid-footerContainer {
      border-top: none;
    }
  }
`

export const DataGridStyled = styled(DataGrid)`
  && {
    &.MuiDataGrid-root {
      background: ${({ theme }) => theme.palette.background.default};
      border: none;
      border-radius: 0;
    }

    & .MuiDataGrid-columnHeaders {
      background: ${({ theme }) => theme.palette.background.paper};
    }

    & .MuiDataGrid-columnHeader {
      padding: ${({ theme }) => theme.spacing(0.25, 2)};
      background: ${({ theme }) => theme.palette.background.paper};

      & .MuiDataGrid-columnHeaderTitle {
        color: ${({ theme }) => theme.palette.text.secondary};
        font-weight: 600;
        line-height: 1.5;
      }

      &.MuiDataGrid-withBorderColor {
        border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
      }

      &:focus-within {
        outline: none;
      }
    }

    & .MuiDataGrid-columnSeparator {
      color: ${({ theme }) => theme.palette.divider};
    }
  }
`

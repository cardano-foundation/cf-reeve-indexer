import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { ArrowDown, ArrowUp } from 'iconsax-react'
import { styled } from 'styled-components'

import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'

export const TableContainerRStyled = styled(TableContainer)`
  && {
    border-radius: 0;
  }
`

export const TableStyled = styled(Table)`
  && {
    width: 100%;
    table-layout: fixed;
  }
`

export const TableRowHeadStyled = styled(TableRow)`
  && {
    background: ${({ theme }) => theme.palette.background.paper};
    border: none;
  }
`

export const TableHeadCellSelectionStyled = styled(TableCell)`
  && {
    padding: ${({ theme }) => theme.spacing(0.5, 2)};
    background: ${({ theme }) => theme.palette.background.paper};
    border-bottom: ${({ theme }) => `1px solid ${theme.palette.divider}`};
  }
`

export const TableHeadCellCollapseStyled = styled(TableCell)`
  && {
    padding: ${({ theme }) => theme.spacing(0.75, 2)};
    background: ${({ theme }) => theme.palette.background.paper};
    border-bottom: ${({ theme }) => `1px solid ${theme.palette.divider}`};
  }
`

interface TableHeadCellStyledProps {
  $isSticky?: boolean
}

export const TableHeadCellStyled = styled(TableCell)<TableHeadCellStyledProps>`
  && {
    height: 3rem;
    padding: ${({ theme }) => theme.spacing(0.25, 2)};
    background: ${({ theme }) => theme.palette.background.paper};
    border-bottom: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: 600;
    white-space: nowrap;

    ${({ $isSticky }) =>
      $isSticky &&
      `
      position: sticky;
      right: 0;
    `}
  }
`

export const TableSortLabelStyled = styled(TableSortLabel)`
  && {
    gap: ${({ theme }) => theme.spacing(0.25)};

    &.Mui-active {
      color: inherit;

      & .MuiButtonBase-root {
        visibility: visible;
      }
    }

    & .MuiButtonBase-root {
      visibility: hidden;
    }

    &:hover {
      color: inherit;

      & .MuiButtonBase-root {
        visibility: visible;
      }
    }
  }
`

interface TableRowBodyStyledProps {
  $hasCollapsableRows?: boolean
}

export const TableRowBodyStyled = styled(TableRow)<TableRowBodyStyledProps>`
  && {
    border: none;

    ${({ $hasCollapsableRows }) =>
      $hasCollapsableRows
        ? `
          &:nth-last-of-type(1),
          &:nth-last-of-type(2) {
            & > .MuiTableCell-root {
              border: none;
            }
          `
        : `
          &:nth-last-of-type(1) {
            & > .MuiTableCell-root {
              border: none;
            }
          }
          `}
  }
`

interface TableBodyCellStyledProps {
  $isExpanded: boolean
  $isSticky?: boolean
}

export const TableBodyCellSelectionStyled = styled(TableCell)<TableBodyCellStyledProps>`
  && {
    padding: ${({ theme }) => theme.spacing(0.25, 2)};
    background: ${({ theme }) => theme.palette.background.default};
    border-bottom: ${({ theme, $isExpanded }) => (!$isExpanded ? `1px solid ${theme.palette.divider}` : 'none')};
  }
`

export const TableBodyCellCollapseStyled = styled(TableCell)<TableBodyCellStyledProps>`
  && {
    padding: ${({ theme }) => theme.spacing(0.25, 2)};
    background: ${({ theme }) => theme.palette.background.default};
    border-bottom: ${({ theme, $isExpanded }) => (!$isExpanded ? `1px solid ${theme.palette.divider}` : 'none')};
  }
`

export const TableBodyCellStyled = styled(TableCell)<TableBodyCellStyledProps>`
  && {
    height: 3.25rem;
    padding: ${({ theme }) => theme.spacing(0.25, 2)};
    background: ${({ theme }) => theme.palette.background.default};
    border-bottom: ${({ theme, $isExpanded }) => (!$isExpanded ? `1px solid ${theme.palette.divider}` : 'none')};

    ${({ $isSticky }) =>
      $isSticky &&
      `
      position: sticky;
      right: 0;
    `}
  }
`

export const TableBodyCellCollapsableStyled = styled(TableCell)<TableBodyCellStyledProps>`
  && {
    padding: 0;
    border-bottom: ${({ theme, $isExpanded }) => ($isExpanded ? `1px solid ${theme.palette.divider}` : 'none')};
  }
`

export const TableBodyCellEmptyStyled = styled(TableCell)`
  && {
    border: none;
  }
`
export const ButtonSortIconStyled = styled(ButtonIcon)`
  && {
    padding: ${({ theme }) => theme.spacing(1.5)};
  }
`

export const IconArrowUpStyled = styled(() => <ArrowUp size={20} variant="Outline" />)``

export const IconArrowDownStyled = styled(() => <ArrowDown size={20} variant="Outline" />)``

export const TableContainerStyled = styled(Box)`
  && {
    background: ${({ theme }) => theme.palette.background.default};
    border: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  }
`

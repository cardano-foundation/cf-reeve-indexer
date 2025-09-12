import TablePagination, { TablePaginationProps } from '@mui/material/TablePagination'
import { ArrowDown2, ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import { styled } from 'styled-components'

export const NextPageIconStyled = styled(({ ...props }) => <ArrowRight2 size={18} variant="Outline" {...props} />)``

export const PreviousPageIconStyled = styled(({ ...props }) => <ArrowLeft2 size={18} variant="Outline" {...props} />)``

export const SelectIconStyled = styled(({ ...props }) => <ArrowDown2 size={18} variant="Outline" {...props} />)`
  && {
    top: unset;
  }
`

export const TablePaginationStyled = styled(TablePagination)<TablePaginationProps>`
  && {
    display: flex;
    align-items: center;
    flex: 1 0 auto;
    background: ${({ theme }) => theme.palette.common.white};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};

    & .MuiToolbar-root {
      width: 100%;
      padding: ${({ theme }) => theme.spacing(0, 1, 0, 2)};
    }
  }
`

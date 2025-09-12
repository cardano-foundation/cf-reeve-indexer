import { GridPagination } from '@mui/x-data-grid'
import { ArrowDown2, ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import { styled } from 'styled-components'

export const NextPapeIconStyled = styled(({ ...props }) => <ArrowRight2 size={18} variant="Outline" {...props} />)``

export const PreviousPageIconStyled = styled(({ ...props }) => <ArrowLeft2 size={18} variant="Outline" {...props} />)``

export const SelectIconStyled = styled(({ ...props }) => <ArrowDown2 size={18} variant="Outline" {...props} />)`
  && {
    top: unset;
  }
`

export const GridPaginationStyled = styled(({ ...props }) => <GridPagination {...props} />)`
  && {
    display: flex;
    align-items: center;
    background: ${({ theme }) => theme.palette.common.white};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};

    & .MuiToolbar-root {
      width: 100%;
      padding: ${({ theme }) => theme.spacing(0, 1, 0, 2)};

      & .MuiTablePagination-selectLabel {
        display: flex;
      }

      & .MuiTablePagination-select {
        display: flex;
      }
    }
  }
`

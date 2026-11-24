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

export const PageInputStyled = styled.input`
  width: 3rem;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  font: inherit;
  color: inherit;
  text-align: center;
  background: ${({ theme }) => theme.palette.common.white};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.spacing(1)};

  &:hover {
    border-color: ${({ theme }) => theme.palette.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.palette.primary.main};
    outline-offset: -1px;
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

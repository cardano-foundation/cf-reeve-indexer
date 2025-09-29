import { Box } from '@mui/material'
import { TablePaginationProps as TablePaginationMUIProps } from '@mui/material/TablePagination'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { GridPaginationStyled, NextPapeIconStyled, PreviousPageIconStyled, SelectIconStyled } from 'libs/ui-kit/components/DataGridPagination/DataGridPagination.styles.tsx'

type DataGridPaginationProps = Partial<TablePaginationMUIProps>

export const DataGridPagination = ({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange, ...props }: DataGridPaginationProps) => {
  const { t } = useTranslations()

  return (
    <GridPaginationStyled
      component={Box}
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      slotProps={{
        actions: {
          nextButton: {
            'aria-label': 'next-page',
            title: t({ id: 'nextPage' })
          },
          previousButton: {
            'aria-label': 'previous-page',
            title: t({ id: 'previousPage' })
          }
        },
        select: {
          IconComponent: SelectIconStyled
        }
      }}
      slots={{
        actions: {
          nextButtonIcon: NextPapeIconStyled,
          previousButtonIcon: PreviousPageIconStyled
        }
      }}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      {...props}
    />
  )
}

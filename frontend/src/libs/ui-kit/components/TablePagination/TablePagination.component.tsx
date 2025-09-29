import Box from '@mui/material/Box'
import { TablePaginationProps as TablePaginationMUIProps } from '@mui/material/TablePagination'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { NextPageIconStyled, PreviousPageIconStyled, SelectIconStyled, TablePaginationStyled } from 'libs/ui-kit/components/TablePagination/TablePagination.styles.tsx'

export type TablePaginationProps = TablePaginationMUIProps

export const TablePagination = ({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange, ...props }: TablePaginationProps) => {
  const { t } = useTranslations()

  return (
    <TablePaginationStyled
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
          nextButtonIcon: NextPageIconStyled,
          previousButtonIcon: PreviousPageIconStyled
        }
      }}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      {...props}
    />
  )
}

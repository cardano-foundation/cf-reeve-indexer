import { Box } from '@mui/material'
import { TablePaginationProps as TablePaginationMUIProps } from '@mui/material/TablePagination'
import { gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid'
import { KeyboardEvent, useEffect, useState } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import {
  GridPaginationStyled,
  NextPapeIconStyled,
  PageInputStyled,
  PreviousPageIconStyled,
  SelectIconStyled
} from 'libs/ui-kit/components/DataGridPagination/DataGridPagination.styles.tsx'
import { formatNumber } from 'libs/utils/format.ts'

declare module '@mui/x-data-grid' {
  interface PaginationPropsOverrides {
    hasPageInput?: boolean
  }
}

const DataGridPaginationPageInput = () => {
  const { t } = useTranslations()
  const apiRef = useGridApiContext()
  const page = useGridSelector(apiRef, gridPageSelector)
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)
  const [value, setValue] = useState(String(page + 1))

  useEffect(() => {
    setValue(String(page + 1))
  }, [page])

  const handleCommit = () => {
    const nextPage = Number.parseInt(value, 10)

    if (Number.isNaN(nextPage)) {
      setValue(String(page + 1))

      return
    }

    const clampedPage = Math.min(Math.max(nextPage, 1), Math.max(pageCount, 1))

    setValue(String(clampedPage))
    apiRef.current.setPage(clampedPage - 1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleCommit()
  }

  return (
    <Box component="span" display="flex" alignItems="center" gap={1}>
      <span>{t({ id: 'paginationPage' })}</span>
      <PageInputStyled
        aria-label={t({ id: 'paginationPage' })}
        inputMode="numeric"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
      />
      <span>{t({ id: 'paginationOfPages' }, { count: formatNumber(Math.max(pageCount, 1), { minimumFractionDigits: 0, maximumFractionDigits: 0 }) })}</span>
    </Box>
  )
}

type DataGridPaginationProps = Partial<TablePaginationMUIProps> & {
  hasPageInput?: boolean
}

export const DataGridPagination = ({ count, page, rowsPerPage, onPageChange, onRowsPerPageChange, hasPageInput, ...props }: DataGridPaginationProps) => {
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
      {...(hasPageInput ? { labelDisplayedRows: () => <DataGridPaginationPageInput /> } : {})}
      {...props}
    />
  )
}

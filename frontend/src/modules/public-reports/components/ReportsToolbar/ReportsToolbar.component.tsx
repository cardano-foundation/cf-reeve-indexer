import { ArrowDown, ArrowUp } from 'iconsax-react'

import { DRAWER_TYPES } from 'consts'
import { TableToolbar } from 'features/common'
import { FieldCheckbox, FieldText, FieldCombobox } from 'features/forms'
import { Badge, Box, Divider, ToggleButton, ToggleButtonGroup } from 'features/mui/base'
import { useMediaQueries } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { DEFAULT_REPORTS_FILTERS_VALUES } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.consts'

import { DEFAULT_REPORTS_QUICK_FILTERS_VALUES } from './ReportsToolbar.consts'
import { useReportsToolbar, useReportsActionControls, useReportsQuickFilters } from './ReportsToolbar.hooks'
import { SearchIconStyled, SortIconStyled } from './ReportsToolbar.styles'
import type { ReportsQuickFiltersProps } from './ReportsToolbar.types'

const ReportsQuickFilters = ({ options }: ReportsQuickFiltersProps) => {
  const { t } = useTranslations()

  useReportsQuickFilters()

  const { periodOptions, reportOptions, standardOptions } = options

  return (
    <TableToolbar.QuickFilters isLastFieldSkipped>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'report' })} limitTags={1} name="report" options={reportOptions} multiple />
      </TableToolbar.QuickFilters.Field>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'period' })} limitTags={1} name="period" options={periodOptions} multiple />
      </TableToolbar.QuickFilters.Field>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'standard' })} limitTags={1} name="standard" options={standardOptions} multiple />
      </TableToolbar.QuickFilters.Field>
      <TableToolbar.QuickFilters.Field alignItems="center" display="flex" width="auto">
        <FieldCheckbox label={t({ id: 'attestedOnly' })} name="attestedOnly" />
      </TableToolbar.QuickFilters.Field>
      <Divider orientation="vertical" flexItem />
      <TableToolbar.QuickFilters.Field maxWidth="20rem" width="100%">
        <FieldText name="search" slotProps={{ input: { startAdornment: <SearchIconStyled /> } }} placeholder={t({ id: 'publicReportsSearchPlaceholder' })} type="text" />
      </TableToolbar.QuickFilters.Field>
    </TableToolbar.QuickFilters>
  )
}

const ReportsActionControls = () => {
  const { drawer, visibilityCount, hasFiltersTouched } = useReportsActionControls()

  const { type, onDrawerOpen, isDrawerOpen } = drawer

  const totalQuickFiltersCount = Object.keys(DEFAULT_REPORTS_QUICK_FILTERS_VALUES).length
  const totalFiltersCount = Object.keys(DEFAULT_REPORTS_FILTERS_VALUES).length

  const totalCount = Math.max(totalQuickFiltersCount, totalFiltersCount)

  return (
    <TableToolbar.ActionControls>
      <ToggleButtonGroup aria-label="Public reports toolbar control actions" value={type}>
        {visibilityCount < totalCount && (
          <Badge color="success" variant="dot" invisible={isDrawerOpen || !hasFiltersTouched}>
            <ToggleButton value={DRAWER_TYPES.FILTERS} onClick={onDrawerOpen}>
              <SortIconStyled />
            </ToggleButton>
          </Badge>
        )}
      </ToggleButtonGroup>
    </TableToolbar.ActionControls>
  )
}

const ReportsCompactActionControls = () => {
  const { t } = useTranslations()

  const { drawer, filters, sorting } = useReportsToolbar()

  const { sortBy, sortOrder, handleSorting } = sorting

  const isOldest = sortBy === 'period' && sortOrder === 'asc'

  return (
    <Box display="flex" gap={1} justifyContent="space-between" width="100%">
      <Badge color="success" variant="dot" invisible={!filters.hasFiltersSelected}>
        <ButtonSecondary value={DRAWER_TYPES.FILTERS} startIcon={<SortIconStyled />} onClick={(event) => drawer.onDrawerOpen(event, DRAWER_TYPES.FILTERS)}>
          {t({ id: 'filterAndSearch' })}
        </ButtonSecondary>
      </Badge>
      <ButtonSecondary
        aria-label={t({ id: isOldest ? 'sortedByPeriodOldest' : 'sortedByPeriodNewest' })}
        endIcon={isOldest ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
        onClick={() => handleSorting('period', isOldest ? 'desc' : 'asc')}
      >
        {t({ id: isOldest ? 'oldest' : 'newest' })}
      </ButtonSecondary>
    </Box>
  )
}

export const ReportsToolbar = () => {
  const { isTablet } = useMediaQueries()

  const { drawer, filters, options } = useReportsToolbar()

  const { hasFiltersTouched } = filters

  if (isTablet) return <ReportsCompactActionControls />

  return (
    <TableToolbar {...{ drawer, hasFiltersTouched }}>
      <ReportsQuickFilters {...{ options }} />
      <ReportsActionControls />
    </TableToolbar>
  )
}

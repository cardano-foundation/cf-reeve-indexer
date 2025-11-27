import { DRAWER_TYPES } from 'consts'
import { TableToolbar } from 'features/common'
import { FieldText, FieldCombobox } from 'features/forms'
import { Badge, Divider, ToggleButton, ToggleButtonGroup } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { DEFAULT_REPORTS_FILTERS_VALUES } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.consts'

import { DEFAULT_REPORTS_QUICK_FILTERS_VALUES } from './ReportsToolbar.consts'
import { useReportsToolbar, useReportsActionControls, useReportsQuickFilters } from './ReportsToolbar.hooks'
import { SearchIconStyled, SortIconStyled } from './ReportsToolbar.styles'
import type { ReportsQuickFiltersProps } from './ReportsToolbar.types'

const ReportsQuickFilters = ({ options }: ReportsQuickFiltersProps) => {
  const { t } = useTranslations()

  useReportsQuickFilters()

  const { periodOptions, reportOptions } = options

  return (
    <TableToolbar.QuickFilters isFirstFieldSkipped>
      <TableToolbar.QuickFilters.Field maxWidth="20rem" width="100%">
        <FieldText name="search" slotProps={{ input: { startAdornment: <SearchIconStyled /> } }} placeholder={t({ id: 'publicReportsSearchPlaceholder' })} type="text" />
      </TableToolbar.QuickFilters.Field>
      <Divider orientation="vertical" flexItem />
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'report' })} limitTags={1} name="report" options={reportOptions} multiple />
      </TableToolbar.QuickFilters.Field>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'period' })} limitTags={1} name="period" options={periodOptions} multiple />
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

export const ReportsToolbar = () => {
  const { drawer, filters, options } = useReportsToolbar()

  const { hasFiltersTouched } = filters

  return (
    <TableToolbar {...{ drawer, hasFiltersTouched }}>
      <ReportsQuickFilters {...{ options }} />
      <ReportsActionControls />
    </TableToolbar>
  )
}

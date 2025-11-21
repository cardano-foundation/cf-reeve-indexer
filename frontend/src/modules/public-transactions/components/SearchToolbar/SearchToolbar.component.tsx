import { DRAWER_TYPES } from 'consts'
import { TableToolbar } from 'features/common'
import { FieldDateCombobox, FieldText, FieldCombobox } from 'features/forms'
import { Badge, Divider, ToggleButton, ToggleButtonGroup } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { DEFAULT_SEARCH_FILTERS_VALUES } from 'modules/public-transactions/components/SearchFilters/SearchFilters.consts'

import { useSearchActionControls, useSearchQuickFilters, useSearchToolbar } from './SearchToolbar.hooks'
import { SearchIconStyled, SortIconStyled } from './SearchToolbar.styles'
import type { SearchQuickFiltersProps } from './SearchToolbar.types'

const SearchQuickFilters = ({ options }: SearchQuickFiltersProps) => {
  const { t } = useTranslations()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, values } = useSearchQuickFilters()

  const { transactionNumbersOptions, transactionTypeOptions } = options

  return (
    <TableToolbar.QuickFilters isFirstFieldSkipped>
      <TableToolbar.QuickFilters.Field maxWidth="20rem" width="100%">
        <FieldText name="search" slotProps={{ input: { startAdornment: <SearchIconStyled /> } }} placeholder={t({ id: 'publicTransactionsSearchPlaceholder' })} type="text" />
      </TableToolbar.QuickFilters.Field>
      <Divider orientation="vertical" flexItem />
      <TableToolbar.QuickFilters.FieldGroup>
        <TableToolbar.QuickFilters.Field>
          <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" minDate={dateFromMinDate} maxDate={values.dateTo || dateFromMaxDate} />
        </TableToolbar.QuickFilters.Field>
        <TableToolbar.QuickFilters.Field>
          <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" minDate={values.dateFrom || dateToMinDate} maxDate={dateToMaxDate} />
        </TableToolbar.QuickFilters.Field>
      </TableToolbar.QuickFilters.FieldGroup>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'transactionNumber' })} limitTags={1} name="transactionNumber" options={transactionNumbersOptions} multiple />
      </TableToolbar.QuickFilters.Field>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'transactionType' })} limitTags={1} name="transactionType" options={transactionTypeOptions} multiple />
      </TableToolbar.QuickFilters.Field>
    </TableToolbar.QuickFilters>
  )
}

const SearchActionControls = () => {
  const { drawer, visibilityCount, hasFiltersTouched } = useSearchActionControls()

  const { type, onDrawerOpen, isDrawerOpen } = drawer

  const totalCount = Object.keys(DEFAULT_SEARCH_FILTERS_VALUES).length

  return (
    <TableToolbar.ActionControls>
      <ToggleButtonGroup aria-label="Public transactions toolbar control actions" value={type}>
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

export const SearchToolbar = () => {
  const { drawer, filters, options } = useSearchToolbar()

  const { hasFiltersTouched } = filters

  return (
    <TableToolbar {...{ drawer, hasFiltersTouched }}>
      <SearchQuickFilters {...{ options }} />
      <SearchActionControls />
    </TableToolbar>
  )
}

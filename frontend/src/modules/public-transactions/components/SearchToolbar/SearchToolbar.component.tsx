import { DRAWER_TYPES } from 'consts'
import { TableToolbar } from 'features/common'
import { FieldDateCombobox, FieldText, FieldCombobox } from 'features/forms'
import { Badge, Box, Divider, ToggleButton } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { DEFAULT_SEARCH_FILTERS_VALUES } from 'modules/public-transactions/components/SearchFilters/SearchFilters.consts'

import { useSearchActionControls, useSearchQuickFilters, useSearchToolbar } from './SearchToolbar.hooks'
import { ColumnsIconStyled, ColumnsToggleButtonStyled, ComingSoonToggleButtonStyled, ExportIconStyled, SearchIconStyled, SortIconStyled } from './SearchToolbar.styles'
import type { SearchQuickFiltersProps, SearchToolbarProps } from './SearchToolbar.types'

const SearchQuickFilters = ({ options }: SearchQuickFiltersProps) => {
  const { t } = useTranslations()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, values } = useSearchQuickFilters()

  const { transactionNumberOptions, transactionTypeOptions, transactionNumberSearchTerm, setTransactionNumberSearchTerm, debouncedTransactionNumberSearchTerm } = options

  return (
    <TableToolbar.QuickFilters isFirstFieldSkipped>
      <TableToolbar.QuickFilters.Field maxWidth="20rem" width="100%">
        <FieldText name="search" slotProps={{ input: { startAdornment: <SearchIconStyled /> } }} placeholder={t({ id: 'publicTransactionsSearchPlaceholder' })} type="text" />
      </TableToolbar.QuickFilters.Field>
      <Divider orientation="vertical" flexItem />
      <TableToolbar.QuickFilters.FieldGroup>
        <TableToolbar.QuickFilters.Field>
          <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" minDate={dateFromMinDate} maxDate={values.dateTo?.isValid() ? values.dateTo : dateFromMaxDate} />
        </TableToolbar.QuickFilters.Field>
        <TableToolbar.QuickFilters.Field>
          <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" minDate={values.dateFrom?.isValid() ? values.dateFrom : dateToMinDate} maxDate={dateToMaxDate} />
        </TableToolbar.QuickFilters.Field>
      </TableToolbar.QuickFilters.FieldGroup>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox 
          label={t({ id: 'transactionNumber' })} 
          limitTags={1} name="transactionNumber" 
          options={transactionNumberOptions} 
          multiple 
          noOptionsText={debouncedTransactionNumberSearchTerm ? t({ id: 'noOptionsTransactionNumber' }) : t({ id: 'transactionNumberSearchPlaceholder' })}
          inputValue={transactionNumberSearchTerm} 
          onInputChange={(_event, value, reason) => { 
            if (reason !== 'reset') setTransactionNumberSearchTerm(value) }} 
          filterOptions={(x) => x} />
      </TableToolbar.QuickFilters.Field>
      <TableToolbar.QuickFilters.Field>
        <FieldCombobox label={t({ id: 'transactionType' })} limitTags={1} name="transactionType" options={transactionTypeOptions} multiple />
      </TableToolbar.QuickFilters.Field>
    </TableToolbar.QuickFilters>
  )
}

const SearchActionControls = ({ columnsPanelId, isColumnsOpen, onColumnsToggle }: SearchToolbarProps) => {
  const { t } = useTranslations()
  const { drawer, visibilityCount, hasFiltersTouched, onDrawerClose } = useSearchActionControls()

  const { type, onDrawerOpen, isDrawerOpen } = drawer

  const totalCount = Object.keys(DEFAULT_SEARCH_FILTERS_VALUES).length

  return (
    <TableToolbar.ActionControls>
      <Box role="group" aria-label="Public transactions toolbar control actions" display="flex" alignItems="center" gap={1}>
        <Tooltip title={t({ id: 'manageColumns' })}>
          <ColumnsToggleButtonStyled
            value="columns"
            aria-controls={isColumnsOpen ? columnsPanelId : undefined}
            aria-expanded={isColumnsOpen}
            aria-haspopup="true"
            aria-label={t({ id: 'manageColumns' })}
            onClick={onColumnsToggle}
            onPointerUp={(event) => {
              if (isColumnsOpen) event.stopPropagation()
            }}
          >
            <ColumnsIconStyled />
          </ColumnsToggleButtonStyled>
        </Tooltip>
        <Tooltip title={t({ id: 'publicTransactionsExportComingSoon' })} describeChild>
          <ComingSoonToggleButtonStyled value="export" aria-label={t({ id: 'publicTransactionsExport' })} aria-disabled disableRipple>
            <ExportIconStyled />
          </ComingSoonToggleButtonStyled>
        </Tooltip>
        {visibilityCount < totalCount && (
          <Badge color="success" variant="dot" invisible={isDrawerOpen || !hasFiltersTouched}>
            <ToggleButton value={DRAWER_TYPES.FILTERS} selected={type === DRAWER_TYPES.FILTERS} onClick={isDrawerOpen ? onDrawerClose : onDrawerOpen}>
              <SortIconStyled />
            </ToggleButton>
          </Badge>
        )}
      </Box>
    </TableToolbar.ActionControls>
  )
}

export const SearchToolbar = ({ columnsPanelId, isColumnsOpen, onColumnsToggle }: SearchToolbarProps) => {
  const { drawer, filters, options } = useSearchToolbar()

  const { hasFiltersTouched } = filters

  return (
    <TableToolbar {...{ drawer, hasFiltersTouched }}>
      <SearchQuickFilters {...{ options }} />
      <SearchActionControls columnsPanelId={columnsPanelId} isColumnsOpen={isColumnsOpen} onColumnsToggle={onColumnsToggle} />
    </TableToolbar>
  )
}

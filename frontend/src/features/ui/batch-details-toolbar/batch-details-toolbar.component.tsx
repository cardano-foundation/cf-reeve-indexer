import { DRAWER_TYPES } from 'consts'
import { TableToolbar } from 'features/common'
import { FieldDateCombobox, FieldText } from 'features/forms'
//import { FieldCombobox } from 'features/forms'
import { Badge, Box, Divider, Grid, ToggleButton, ToggleButtonGroup } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
//import { useBatchDetailsFilterOptions } from 'modules/review/hooks/useBatchDetailsFilterOptions.ts'

import { useBatchDetailsToolbar } from './batch-details-toolbar.hooks'
import { SearchIconStyled, SortIconStyled } from './batch-details-toolbar.styles'
import type { BatchDetailsQuickFiltersProps, BatchDetailsActionControlsProps } from './batch-details-toolbar.types'

const BatchDetailsQuickFilters = ({ isDrawerOpen }: BatchDetailsQuickFiltersProps) => {
  const { t } = useTranslations()

  //const { transactionTypeOptions } = useBatchDetailsFilterOptions()

  return (
    <TableToolbar.QuickFilters>
      <Grid maxWidth="20rem" minWidth="17.5rem" size="grow">
        <FieldText name="search" slotProps={{ input: { startAdornment: <SearchIconStyled /> } }} placeholder={t({ id: 'searchPlaceholder' })} type="text" />
      </Grid>
      {!isDrawerOpen ? <Divider orientation="vertical" flexItem /> : <Box />}
      {!isDrawerOpen ? (
        <Grid container flexWrap="nowrap" size="auto" spacing={2}>
          <Grid maxWidth="16rem" minWidth="12.5rem" size="grow">
            <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" />
          </Grid>
          <Grid maxWidth="16rem" minWidth="12.5rem" size="grow">
            <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" />
          </Grid>
        </Grid>
      ) : (
        <Box />
      )}
      {/*     {!isDrawerOpen ? (
        <Grid maxWidth="16rem" minWidth="12.5rem" size="grow">
          <FieldCombobox label={t({ id: 'transactionType' })} limitTags={1} name="transactionType" options={transactionTypeOptions} />
        </Grid>
      ) : (
        <Box />
      )} */}
    </TableToolbar.QuickFilters>
  )
}

const BatchDetailsActionControls = ({ count, drawerType, onDrawerOpen, isDrawerOpen }: BatchDetailsActionControlsProps) => {
  return (
    <TableToolbar.ActionControls>
      <ToggleButtonGroup value={drawerType}>
        <Badge badgeContent={!isDrawerOpen ? count : undefined}>
          <ToggleButton value={DRAWER_TYPES.FILTERS} onClick={onDrawerOpen}>
            <SortIconStyled />
          </ToggleButton>
        </Badge>
      </ToggleButtonGroup>
    </TableToolbar.ActionControls>
  )
}

export const BatchDetailsToolbar = () => {
  const { count, type, handleDrawerOpen, isDrawerOpen } = useBatchDetailsToolbar()

  return (
    <>
      <BatchDetailsQuickFilters {...{ isDrawerOpen }} />
      <BatchDetailsActionControls drawerType={type} onDrawerOpen={handleDrawerOpen} {...{ count, isDrawerOpen }} />
    </>
  )
}

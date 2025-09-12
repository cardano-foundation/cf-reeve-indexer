import { useTheme } from '@mui/material'
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { StatusOption } from 'libs/ui-kit/components/FiltersBatches/hooks/useFilters.ts'
import { AutocompleteMultipleOption, InputAutocompleteMultiple } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'
import { InputDatePicker } from 'libs/ui-kit/components/InputDatePicker/InputDatePicker.component.tsx'

const filterStatusOptionsDefault: StatusOption[] = [
  { name: intl.formatMessage({ id: 'batchApprove' }), value: BatchStatistics.APPROVE },
  { name: intl.formatMessage({ id: 'batchPending' }), value: BatchStatistics.PENDING },
  { name: intl.formatMessage({ id: 'batchInvalid' }), value: BatchStatistics.INVALID },
  { name: intl.formatMessage({ id: 'batchPublish' }), value: BatchStatistics.PUBLISH },
  { name: intl.formatMessage({ id: 'batchPublished' }), value: BatchStatistics.PUBLISHED }
]

interface FiltersBatchesProps {
  selectedDate: dayjs.Dayjs | null
  handleDateChange: (newDate: dayjs.Dayjs | null) => void
  preselectedOrganisation: OrganisationApiResponse
  selectedStatus: StatusOption[]
  handleStatusChange: (
    _event: React.SyntheticEvent<Element, Event>,
    value: AutocompleteMultipleOption[],
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<AutocompleteMultipleOption> | undefined
  ) => void
  areFiltersSelected: boolean
  handleFiltersReset: () => void
  filterStatusOptions?: StatusOption[]
  hasStatusFilter?: boolean
}

export const FiltersBatches = ({
  selectedDate,
  handleDateChange,
  preselectedOrganisation,
  selectedStatus,
  handleStatusChange,
  areFiltersSelected,
  handleFiltersReset,
  filterStatusOptions,
  hasStatusFilter = true
}: FiltersBatchesProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Box display="flex" flex="1 0 auto" gap={2} overflow="auto hidden" p={2} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Box minWidth="14.5rem">
        <InputDatePicker
          id="date"
          name="date"
          label={t({ id: 'date' })}
          value={selectedDate}
          onChange={handleDateChange}
          minDate={dayjs(preselectedOrganisation?.accountPeriodFrom)}
          maxDate={dayjs()}
        />
      </Box>
      {hasStatusFilter && (
        <Box minWidth="14.5rem">
          <InputAutocompleteMultiple
            id="status"
            name="status"
            label={t({ id: 'status' })}
            items={filterStatusOptions ?? filterStatusOptionsDefault}
            value={selectedStatus}
            options={filterStatusOptions ?? filterStatusOptionsDefault}
            onChange={handleStatusChange}
          />
        </Box>
      )}
      <Box display="flex">
        <ButtonText onClick={handleFiltersReset} disabled={!areFiltersSelected}>
          {t({ id: 'clearFilters' })}
        </ButtonText>
      </Box>
    </Box>
  )
}

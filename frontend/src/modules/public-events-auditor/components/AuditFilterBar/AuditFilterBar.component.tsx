import Box from '@mui/material/Box'
import { Dayjs } from 'dayjs'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { InputDatePicker } from 'libs/ui-kit/components/InputDatePicker/InputDatePicker.component.tsx'
import { AutocompleteMultipleOption, InputAutocompleteMultiple } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

interface AuditFilterBarProps {
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  onDateFromChange: (value: Dayjs | null) => void
  onDateToChange: (value: Dayjs | null) => void
  projectOptions: AutocompleteMultipleOption[]
  selectedProjectIds: string[]
  onProjectsChange: (projectIds: string[]) => void
  onClear: () => void
}

/**
 * Page-level filter bar for the auditor view: a reporting period (from and/or to) and a project
 * multiselect. Both drive the entire page — the summary roll-up and the events ledger alike. Event
 * type and free-text search stay inside the ledger, since filtering the roll-up by type would zero
 * out the funded/allocated totals that only FUNDING events contribute.
 */
export const AuditFilterBar = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  projectOptions,
  selectedProjectIds,
  onProjectsChange,
  onClear
}: AuditFilterBarProps) => {
  const { t } = useTranslations()

  const hasSelection = Boolean(dateFrom || dateTo || selectedProjectIds.length > 0)
  const selectedProjects = projectOptions.filter((option) => selectedProjectIds.includes(option.value))

  return (
    <Box alignItems="flex-start" display="flex" flexWrap="wrap" gap={1.5}>
      <Box sx={{ width: { xs: '100%', sm: '11rem' } }}>
        <InputDatePicker label={t({ id: 'from' })} maxDate={dateTo ?? undefined} name="auditDateFrom" value={dateFrom} onChange={onDateFromChange} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '11rem' } }}>
        <InputDatePicker label={t({ id: 'to' })} minDate={dateFrom ?? undefined} name="auditDateTo" value={dateTo} onChange={onDateToChange} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '22rem' } }}>
        <InputAutocompleteMultiple
          items={projectOptions}
          options={projectOptions}
          label={t({ id: 'auditProjectFilterLabel' })}
          name="auditProjects"
          placeholder={selectedProjects.length === 0 ? t({ id: 'auditProjectFilterPlaceholder' }) : undefined}
          value={selectedProjects}
          onChange={(_event, options) => onProjectsChange(options.map((option) => option.value))}
        />
      </Box>
      {hasSelection && (
        <Box sx={{ alignSelf: 'center' }}>
          <ButtonText onClick={onClear} size="small">
            {t({ id: 'clearAll' })}
          </ButtonText>
        </Box>
      )}
    </Box>
  )
}

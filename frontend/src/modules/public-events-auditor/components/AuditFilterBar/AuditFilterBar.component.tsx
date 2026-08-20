import Box from '@mui/material/Box'
import { Dayjs } from 'dayjs'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { InputDatePicker } from 'libs/ui-kit/components/InputDatePicker/InputDatePicker.component.tsx'

interface AuditFilterBarProps {
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  onDateFromChange: (value: Dayjs | null) => void
  onDateToChange: (value: Dayjs | null) => void
  onClear: () => void
}

/**
 * Page-level filter bar for the auditor view: a reporting period (from and/or to)
 */
export const AuditFilterBar = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear
}: AuditFilterBarProps) => {
  const { t } = useTranslations()

  const hasSelection = Boolean(dateFrom || dateTo)

  return (
    <Box alignItems="flex-start" display="flex" flexWrap="wrap" gap={1.5}>
      <Box sx={{ width: { xs: '100%', sm: '11rem' } }}>
        <InputDatePicker label={t({ id: 'from' })} maxDate={dateTo ?? undefined} name="auditDateFrom" value={dateFrom} onChange={onDateFromChange} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '11rem' } }}>
        <InputDatePicker label={t({ id: 'to' })} minDate={dateFrom ?? undefined} name="auditDateTo" value={dateTo} onChange={onDateToChange} />
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

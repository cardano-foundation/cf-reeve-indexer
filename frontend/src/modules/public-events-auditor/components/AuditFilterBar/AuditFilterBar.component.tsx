import Box from '@mui/material/Box'
import { Dayjs } from 'dayjs'
import { useFormikContext } from 'formik'

import { FieldDateCombobox } from 'features/forms'
import { useDatesRange } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'

export interface AuditFilterValues {
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
}

interface AuditFilterBarProps {
  onClear: () => void
}

/**
 * Page-level filter bar for the auditor view: a reporting period (from and/or to)
 */
export const AuditFilterBar = ({ onClear }: AuditFilterBarProps) => {
  const { t } = useTranslations()
  const { values } = useFormikContext<AuditFilterValues>()
  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate } = useDatesRange()

  const hasSelection = Boolean(values.dateFrom || values.dateTo)

  return (
    <Box alignItems="flex-start" display="flex" flexWrap="wrap" gap={1.5}>
      <Box sx={{ width: { xs: '100%', sm: '16rem' } }}>
        <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" minDate={dateFromMinDate} maxDate={values.dateTo?.isValid() ? values.dateTo : dateFromMaxDate} />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '16rem' } }}>
        <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" minDate={values.dateFrom?.isValid() ? values.dateFrom : dateToMinDate} maxDate={dateToMaxDate} />
      </Box>
      {hasSelection && (
        <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', height: '2.5rem' }}>
          <ButtonText onClick={onClear} size="small">
            {t({ id: 'clearAll' })}
          </ButtonText>
        </Box>
      )}
    </Box>
  )
}

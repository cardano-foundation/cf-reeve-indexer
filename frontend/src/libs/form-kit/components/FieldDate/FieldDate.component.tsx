import dayjs, { Dayjs } from 'dayjs'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputDatePicker } from 'libs/ui-kit/components/InputDatePicker/InputDatePicker.component.tsx'

const MIN_DATE = '2022-01-01'

interface FieldDateProps {
  minDate?: string
  maxDate?: string
  disabled?: boolean
}

export const FieldDate = ({ minDate, maxDate, disabled = false }: FieldDateProps) => {
  const [field, meta, helpers] = useField<string>({ name: 'date', type: 'date' })

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  const handleChange = (newDate: Dayjs | null) => {
    const value = newDate ? newDate.format('DD-MM-YYYY') : null

    field.onChange({ target: { name: field.name, value } })
    helpers.setTouched(true, false)
  }

  return (
    <InputDatePicker
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={`${t({ id: 'date' })}`}
      name={field.name}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      minDate={dayjs(minDate ? minDate : MIN_DATE)}
      value={field.value ? dayjs(field.value, 'DD-MM-YYYY') : null}
      onChange={handleChange}
      disabled={disabled}
    />
  )
}

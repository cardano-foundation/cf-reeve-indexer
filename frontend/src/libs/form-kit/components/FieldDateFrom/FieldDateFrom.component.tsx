import dayjs, { Dayjs } from 'dayjs'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputDatePicker } from 'libs/ui-kit/components/InputDatePicker/InputDatePicker.component.tsx'

interface FieldDateFromProps {
  minDate?: Dayjs
  maxDate?: Dayjs
  isDisabled?: boolean
}

export const FieldDateFrom = ({ minDate, maxDate, isDisabled = false }: FieldDateFromProps) => {
  const [field, meta, helpers] = useField<Dayjs | null>({ name: 'dateFrom' })

  const { t } = useTranslations()

  const handleChange = (newDate: Dayjs | null) => {
    field.onChange({ target: { name: field.name, value: newDate } })

    helpers.setTouched(true, false)
  }

  return (
    <InputDatePicker
      id={field.name}
      label={`${t({ id: 'from' })} *`}
      name={field.name}
      minDate={minDate}
      maxDate={maxDate}
      value={field.value ? dayjs(field.value, 'DD-MM-YYYY') : null}
      onChange={handleChange}
      disabled={isDisabled}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : ''}
    />
  )
}

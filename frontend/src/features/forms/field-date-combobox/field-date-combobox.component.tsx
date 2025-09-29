import dayjs, { type Dayjs } from 'dayjs'
import { useField } from 'formik'
import { useCallback } from 'react'

import { DateCombobox } from 'features/common'

import type { FieldDateComboboxProps } from './field-date-combobox.types'

export const FieldDateCombobox = ({ helperText, label, maxDate, minDate, name, disabled, required, ...props }: FieldDateComboboxProps) => {
  const [field, meta, helpers] = useField<Dayjs | null>({ name })

  const hasError = meta.touched && Boolean(meta.error)

  const handleChange = useCallback(
    (newDate: Dayjs | null) => {
      const value = newDate ? newDate.format('DD-MM-YYYY') : null

      field.onChange({ target: { name: field.name, value } })
      helpers.setTouched(true, false)
    },
    [field, helpers]
  )

  return (
    <DateCombobox
      name={field.name}
      textField={{ helperText: hasError ? meta.error : helperText, label, error: hasError, required }}
      value={field.value ? dayjs(field.value, 'DD-MM-YYYY') : null}
      onChange={handleChange}
      {...{ maxDate, minDate, disabled, ...props }}
    />
  )
}

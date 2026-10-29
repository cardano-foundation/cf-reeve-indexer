import dayjs, { type Dayjs } from 'dayjs'
import { useField } from 'formik'
import { type FocusEvent, useCallback, useState } from 'react'

import { DateCombobox } from 'features/common'

import type { FieldDateComboboxProps } from './field-date-combobox.types'

export const FieldDateCombobox = ({ helperText, label, maxDate, minDate, name, disabled, required, ...props }: FieldDateComboboxProps) => {
  const [field, meta, helpers] = useField<Dayjs | null>({ name })

  const [isEditing, setIsEditing] = useState(false)

  const hasError = !isEditing && Boolean(meta.error)

  const handleChange = useCallback(
    (newDate: Dayjs | null) => {
      const value = newDate ? newDate : null

      field.onChange({ target: { name: field.name, value } })
      helpers.setTouched(true, false)
      setIsEditing(true)
    },
    [field, helpers]
  )

  const handleBlur = useCallback((event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsEditing(false)
  }, [])

  return (
    <DateCombobox
      name={field.name}
      textField={{ helperText: hasError ? meta.error : helperText, label, error: hasError, onBlur: handleBlur, required }}
      value={field.value ? dayjs(field.value) : null}
      onChange={handleChange}
      {...{ maxDate, minDate, disabled, ...props }}
    />
  )
}

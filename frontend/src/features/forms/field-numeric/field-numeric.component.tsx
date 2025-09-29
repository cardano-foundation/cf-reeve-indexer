import { useField } from 'formik'
import { type FocusEvent } from 'react'

import { InputNumeric } from 'features/common'
import { formatNumber } from 'libs/utils/format'
import { formatToFloatReadyFormat } from 'modules/public-reports/utils/format'

import type { FieldNumericProps } from './field-numeric.types'

export const FieldNumeric = ({ helperText, label, name, disabled, required, ...props }: FieldNumericProps) => {
  const [field, meta, helpers] = useField<string>({ name })

  const hasError = meta.touched && Boolean(meta.error)

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) return

    const value = formatToFloatReadyFormat(event.target.value)

    field.onBlur(name)
    helpers.setTouched(true)
    helpers.setValue(formatNumber(parseFloat(value)))
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) return

    const value = formatToFloatReadyFormat(event.target.value)

    helpers.setValue(parseFloat(value).toFixed(2).toString())
  }

  return (
    <InputNumeric
      helperText={meta.touched && meta.error ? meta.error : helperText}
      name={field.name}
      value={field.value}
      onBlur={handleBlur}
      onChange={field.onChange}
      onFocus={handleFocus}
      error={hasError}
      {...{ label, disabled, required, ...props }}
    />
  )
}

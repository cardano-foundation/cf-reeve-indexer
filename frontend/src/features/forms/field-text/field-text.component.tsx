import { useField } from 'formik'

import { InputText } from 'features/common'

import type { FieldTextProps } from './field-text.types'

export const FieldText = ({ helperText, label, name, type, disabled, required, ...props }: FieldTextProps) => {
  const [field, meta] = useField<string>({ name })

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputText
      helperText={meta.touched && meta.error ? meta.error : helperText}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      error={hasError}
      {...{ label, type, disabled, required, ...props }}
    />
  )
}

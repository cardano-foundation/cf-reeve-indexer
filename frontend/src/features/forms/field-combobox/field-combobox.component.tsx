import { useField } from 'formik'
import { useCallback, useMemo, type SyntheticEvent } from 'react'

import { Combobox } from 'features/common'
import type { AutocompleteOption } from 'features/mui/base'

import type { FieldComboboxProps } from './field-combobox.types'

export const FieldCombobox = ({ helperText, label, name, options, disabled, required, ...props }: FieldComboboxProps) => {
  const [field, meta] = useField<string[]>({ name })

  const value = useMemo(() => field.value.map((value) => options.find((option) => option.value === value)).filter((option) => option !== undefined), [field.value, options])

  const hasError = meta.touched && Boolean(meta.error)

  const handleChange = useCallback(
    (_event: SyntheticEvent, newSelectedOpions: (string | AutocompleteOption)[]) => {
      const values = newSelectedOpions.map((newValue) => (typeof newValue === 'string' ? newValue : newValue.value))

      field.onChange({ target: { name: field.name, value: values } })
    },
    [field.name, value, field.onChange]
  )

  return (
    <Combobox
      textField={{
        name: field.name,
        label,
        error: hasError,
        helperText: hasError ? meta.error : undefined
      }}
      onBlur={field.onBlur}
      onChange={handleChange}
      {...{ label, options, value, disabled, required, ...props }}
    />
  )
}

import { useField } from 'formik'
import { useCallback, useMemo, type SyntheticEvent } from 'react'

import { Combobox } from 'features/common'
import { type AutocompleteOption } from 'features/mui/base'

import type { FieldComboboxProps } from './field-combobox.types'

export const FieldCombobox = <Multiple extends boolean | undefined, DisableClearable extends boolean | undefined, FreeSolo extends boolean | undefined>({
  helperText,
  label,
  name,
  options,
  onChange,
  disabled,
  multiple,
  required,
  isGroupRendered,
  ...props
}: FieldComboboxProps<Multiple, DisableClearable, FreeSolo>) => {
  const [field, meta] = useField<string | string[]>({ name })

  const value = useMemo(() => {
    if (typeof field.value === 'string') {
      return options.find((option) => option.value === field.value) ?? null
    }

    if (Array.isArray(field.value)) {
      return field.value.map((value) => options.find((option) => option.value === value)).filter((option): option is AutocompleteOption => option !== undefined)
    }

    return null
  }, [field.value, options])

  const normalizedValue = multiple ? (Array.isArray(value) ? value : value !== undefined && value !== null ? [value] : []) : value !== undefined ? value : undefined

  const hasError = meta.touched && Boolean(meta.error)

  const handleChange = useCallback(
    (_event: SyntheticEvent, newSelectedOptions: (string | AutocompleteOption) | (string | AutocompleteOption)[] | null) => {
      const values = Array.isArray(newSelectedOptions)
        ? newSelectedOptions.map((selected) => (typeof selected === 'string' ? selected : selected.value))
        : typeof newSelectedOptions === 'string'
          ? newSelectedOptions
          : newSelectedOptions
            ? newSelectedOptions.value
            : ''

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
        helperText: hasError ? meta.error : helperText,
        required
      }}
      // @ts-expect-error - separate single and multiple select components
      value={normalizedValue}
      onBlur={field.onBlur}
      onChange={onChange ? onChange : handleChange}
      {...{ label, options, disabled, multiple, required, isGroupRendered, ...props }}
    />
  )
}

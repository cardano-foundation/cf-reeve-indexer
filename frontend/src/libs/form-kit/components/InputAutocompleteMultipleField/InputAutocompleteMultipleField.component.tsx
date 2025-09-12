import { SyntheticEvent, useEffect, useState } from 'react'

import {
  AutocompleteMultipleOption,
  InputAutocompleteMultiple,
  InputAutocompleteMultipleProps
} from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

export interface InputAutocompleteMultipleFieldProps extends InputAutocompleteMultipleProps {
  field: {
    name: string
  }
  form: {
    setFieldValue: (_fieldName: string, _value: string[]) => void
  }
  valueToChange: AutocompleteMultipleOption[]
  isDisabled?: boolean
}

export const InputAutocompleteMultipleField = ({ items, field, label, form, value, disabled, options, placeholder }: InputAutocompleteMultipleFieldProps) => {
  const [selectValue, setSelectValue] = useState<string[]>([])

  useEffect(() => {
    form.setFieldValue(field.name, selectValue)
  }, [selectValue])

  const handleChange = (_event: SyntheticEvent, newSelectedOptions: AutocompleteMultipleOption[]) => {
    const newSelectedValues = newSelectedOptions.map((option) => option.value)
    setSelectValue(newSelectedValues)
  }

  return (
    <InputAutocompleteMultiple
      id={field.name}
      name={field.name}
      label={label}
      items={items}
      value={value}
      disabled={disabled}
      options={options}
      placeholder={placeholder}
      onChange={handleChange}
    />
  )
}

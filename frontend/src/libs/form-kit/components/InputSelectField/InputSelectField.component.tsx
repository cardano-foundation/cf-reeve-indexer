import { SelectChangeEvent, SelectProps } from '@mui/material'
import { useState, useEffect, ReactNode } from 'react'

import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

export type SelectGenericProps = SelectProps & {
  label?: ReactNode
  value: string
  items: SelectOption[]
  name: string
  field: {
    name: string
  }
  form: {
    setFieldValue: (fieldName: string, value: string) => void
  }
  valueToChange: string
  isDisabled?: boolean
}

export const InputSelectField = ({ items, form, field, label, value, disabled }: SelectGenericProps) => {
  const [selectValue, setSelectValue] = useState({
    name: '',
    value: value || ''
  })

  useEffect(() => {
    form.setFieldValue(field.name, selectValue.value)
  }, [selectValue])

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const selectedItem = items.find((item) => item.value === event.target.value)

    if (selectedItem) {
      setSelectValue({
        name: selectedItem.name,
        value: selectedItem.value as string
      })
    }
  }

  return <InputSelect id={field.name} name={field.name} label={label} items={items} value={selectValue.value} disabled={disabled} onChange={(event) => handleChange(event)} />
}

import { useField } from 'formik'
import { useMemo } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import {
  AutocompleteMultipleOption,
  InputAutocompleteMultiple,
  InputAutocompleteMultipleProps
} from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

interface FieldAccountTypeProps {
  items: AutocompleteMultipleOption[]
  onChange: InputAutocompleteMultipleProps['onChange']
}

export const FieldAccountType = ({ items, onChange }: FieldAccountTypeProps) => {
  const [field] = useField<string[]>('accountType')

  const { t } = useTranslations()

  const value = useMemo(() => field.value.map((value) => items.find((item) => item.value === value)).filter((item) => item !== undefined), [field.value, items])

  const hasValue = value.length > 0

  return (
    <InputAutocompleteMultiple
      id={field.name}
      label={t({ id: 'accountType' })}
      items={items}
      name={field.name}
      options={items}
      placeholder={!hasValue ? 'All' : ''}
      value={value}
      onChange={onChange}
    />
  )
}

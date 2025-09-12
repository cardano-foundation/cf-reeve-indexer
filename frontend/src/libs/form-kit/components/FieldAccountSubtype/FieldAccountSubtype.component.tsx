import { useField } from 'formik'
import { useMemo } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputAutocompleteDropdownGroup } from 'libs/ui-kit/components/InputAutocompleteDropdownGroup/InputAutocompleteDropdownGroup.component'
import {
  AutocompleteMultipleOption,
  InputAutocompleteMultiple,
  InputAutocompleteMultipleProps
} from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

interface FieldAccountSubtypeProps {
  items: AutocompleteMultipleOption[]
  onChange: InputAutocompleteMultipleProps['onChange']
}

export const FieldAccountSubtype = ({ items, onChange }: FieldAccountSubtypeProps) => {
  const [field] = useField<string[]>('accountSubtype')

  const { t } = useTranslations()

  const value = useMemo(() => field.value.map((value) => items.find((item) => item.value === value)).filter((item) => item !== undefined), [field.value, items])

  const hasValue = value.length > 0

  return (
    <InputAutocompleteMultiple
      id={field.name}
      label={t({ id: 'accountSubtype' })}
      items={items}
      groupBy={(option) => (option.group ? option.group : '')}
      renderGroup={InputAutocompleteDropdownGroup}
      name={field.name}
      options={items}
      placeholder={!hasValue ? 'All' : ''}
      value={value}
      onChange={onChange}
    />
  )
}

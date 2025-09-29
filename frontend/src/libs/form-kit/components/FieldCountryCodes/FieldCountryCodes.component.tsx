import { useField } from 'formik'
import { SyntheticEvent } from 'react'

import { type AutocompleteOption, InputAutocomplete } from 'libs/form-kit/components/InputAutocomplete/InputAutocomplete.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldCountryCodes {
  items: AutocompleteOption[]
}

export const FieldCountryCodes = ({ items }: FieldCountryCodes) => {
  const [field] = useField<string>('countryCode')

  const { t } = useTranslations()

  const value = items.find((item) => item.value === field.value) ?? null

  const handleChange = (_event: SyntheticEvent, option: AutocompleteOption | null) => {
    field.onChange({ target: { name: field.name, value: option?.value ?? '' } })
  }

  const hasValue = Boolean(field.value)

  return (
    <InputAutocomplete
      id={field.name}
      label={t({ id: 'country' })}
      name={field.name}
      options={items}
      placeholder={!hasValue ? 'All' : ''}
      value={value}
      onBlur={field.onBlur}
      onChange={handleChange}
    />
  )
}

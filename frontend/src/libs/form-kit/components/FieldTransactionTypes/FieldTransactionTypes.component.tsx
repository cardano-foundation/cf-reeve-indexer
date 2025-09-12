import { useField } from 'formik'
import { SyntheticEvent, useMemo } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { AutocompleteMultipleOption, InputAutocompleteMultiple } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

interface FieldTransactionTypesProps {
  items: AutocompleteMultipleOption[]
  isDisabled?: boolean
}

export const FieldTransactionTypes = ({ items, isDisabled = false }: FieldTransactionTypesProps) => {
  const [field] = useField<string[]>('transactionTypes')

  const { t } = useTranslations()

  const value = useMemo(() => field.value.map((value) => items.find((item) => item.value === value)).filter((item) => item !== undefined), [field.value, items])

  const handleChange = (_event: SyntheticEvent, newSelectedOpions: AutocompleteMultipleOption[]) => {
    const values = newSelectedOpions.map((value) => value.value)

    field.onChange({ target: { name: field.name, value: values } })
  }

  const hasValue = field.value.length > 0

  return (
    <InputAutocompleteMultiple
      id={field.name}
      label={t({ id: 'transactionTypes' })}
      items={items}
      name={field.name}
      options={items}
      placeholder={!hasValue ? 'All' : ''}
      value={value}
      onChange={handleChange}
      disabled={isDisabled}
    />
  )
}

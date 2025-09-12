import { useField } from 'formik'
import { SyntheticEvent, useMemo } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputAutocompleteMultiple, AutocompleteMultipleOption } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

interface FieldProjectProps {
  items: AutocompleteMultipleOption[]
}

export const FieldProject = ({ items }: FieldProjectProps) => {
  const [field] = useField<string[]>('project')

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
      label={t({ id: 'project' })}
      items={items}
      name={field.name}
      options={items}
      placeholder={!hasValue ? 'All' : ''}
      value={value}
      onChange={handleChange}
    />
  )
}

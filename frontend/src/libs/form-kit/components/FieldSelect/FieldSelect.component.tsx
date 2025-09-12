import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldSelectProps {
  name: string
  label: string
  items: SelectOption[]
  disabled?: boolean
  required?: boolean
}

export const FieldSelect = ({ items, name, label, disabled = false, required = false }: FieldSelectProps) => {
  const [field, meta] = useField<string>(name)

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputSelect
      items={items}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={`${t({ id: label })}${required ? ' *' : ''}`}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

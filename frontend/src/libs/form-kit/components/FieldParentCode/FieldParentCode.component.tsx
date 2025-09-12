import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldParentCodeProps {
  items: SelectOption[]
  disabled?: boolean
  required?: boolean
  name?: string
}

export const FieldParentCode = ({ items, disabled = false, required = false, name = 'parentCustomerCode' }: FieldParentCodeProps) => {
  const [field, meta] = useField<string>(name)

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  const hasValue = field.value.length > 0

  return (
    <InputSelect
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : undefined}
      items={items}
      label={`${t({ id: 'parentCustomerCode' })}${required ? ' *' : ''}`}
      name={field.name}
      placeholder={!hasValue ? 'All' : ''}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

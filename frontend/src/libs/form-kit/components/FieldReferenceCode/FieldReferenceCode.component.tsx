import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldReferenceCodeProps {
  items: SelectOption[]
  disabled?: boolean
}

export const FieldReferenceCode = ({ items, disabled = false }: FieldReferenceCodeProps) => {
  const [field, meta] = useField<string>('eventRefCode')

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  const hasValue = field.value.length > 0

  return (
    <InputSelect
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : undefined}
      items={items}
      label={`${t({ id: 'referenceCode' })} *`}
      name={field.name}
      placeholder={!hasValue ? 'All' : ''}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

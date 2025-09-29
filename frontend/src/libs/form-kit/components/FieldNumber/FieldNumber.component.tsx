import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputText } from 'libs/ui-kit/components/InputText/InputText.component.tsx'

interface FieldNumberProps {
  disabled?: boolean
}

export const FieldNumber = ({ disabled }: FieldNumberProps) => {
  const [field, meta] = useField<string>({ name: 'customerCode' })

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputText
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={`${t({ id: 'number' })} *`}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

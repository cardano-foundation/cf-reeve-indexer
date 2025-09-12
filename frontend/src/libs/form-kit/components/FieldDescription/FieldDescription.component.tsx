import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputTextarea } from 'libs/ui-kit/components/InputTextarea/InputTextarea.component.tsx'

interface FieldDescriptionProps {
  disabled?: boolean
  name?: string
}

export const FieldDescription = ({ disabled = false }: FieldDescriptionProps) => {
  const [field, meta] = useField<string>('description')

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputTextarea
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={`${t({ id: 'description' })} *`}
      name={field.name}
      rows={3}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

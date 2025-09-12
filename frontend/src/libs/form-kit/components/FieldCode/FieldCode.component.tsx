import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputText } from 'libs/ui-kit/components/InputText/InputText.component.tsx'

interface FieldCodeProps {
  disabled?: boolean
}

export const FieldCode = ({ disabled }: FieldCodeProps) => {
  const [field, meta] = useField<string>({ name: 'code' })

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputText
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={`${t({ id: 'code' })} *`}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputText } from 'libs/ui-kit/components/InputText/InputText.component.tsx'

interface FieldCounterpartyProps {
  disabled?: boolean
}

export const FieldCounterparty = ({ disabled }: FieldCounterpartyProps) => {
  const [field, meta] = useField<string>({ name: 'counterParty' })

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputText
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={t({ id: 'counterParty' })}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
    />
  )
}

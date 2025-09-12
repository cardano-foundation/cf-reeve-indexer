import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputText } from 'libs/ui-kit/components/InputText/InputText.component.tsx'

interface FieldEventCodeProps {
  disabled?: boolean
  isReadOnly?: boolean
}

export const FieldEventCode = ({ disabled, isReadOnly }: FieldEventCodeProps) => {
  const [field, meta] = useField<string>('eventCode')

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputText
      id={field.name}
      label={t({ id: 'eventCode' })}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
      isReadOnly={isReadOnly}
    />
  )
}

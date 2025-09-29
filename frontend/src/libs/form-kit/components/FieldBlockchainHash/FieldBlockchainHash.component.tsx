import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputTextarea } from 'libs/ui-kit/components/InputTextarea/InputTextarea.component.tsx'

export const FieldBlockchainHash = () => {
  const [field, meta] = useField<string>('blockchainHash')

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputTextarea
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : t({ id: 'blockchainHashHelperText' })}
      label={t({ id: 'blockchainHash' })}
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  )
}

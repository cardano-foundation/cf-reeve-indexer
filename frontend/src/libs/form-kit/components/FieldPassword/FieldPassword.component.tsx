import { Field, useField } from 'formik'

import { InputPasswordField } from 'libs/form-kit/components/InputPasswordField/InputPasswordField.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldPasswordProps {
  name?: string
}

export const FieldPassword = ({ name }: FieldPasswordProps) => {
  const [field, meta, helpers] = useField<string>(name ?? 'password')

  const { t } = useTranslations()

  const handleFocus = () => {
    helpers.setTouched(false, false)
  }

  return (
    <Field
      component={InputPasswordField}
      name={name ?? 'password'}
      label={t({ id: name ?? 'password' })}
      value={field.value}
      size="small"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : ''}
      onFocus={handleFocus}
    />
  )
}

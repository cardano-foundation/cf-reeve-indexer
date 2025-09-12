import { Field, useField } from 'formik'

import { InputTextField } from 'libs/form-kit/components/InpuTextField/InputTextField.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const FieldUsernameOrEmail = () => {
  const [field, meta, helpers] = useField<string>('usernameOrEmail')

  const { t } = useTranslations()

  const handleFocus = () => {
    helpers.setTouched(false, false)
  }

  return (
    <Field
      component={InputTextField}
      name="usernameOrEmail"
      type="email"
      label={t({ id: 'usernameOrEmail' })}
      value={field.value}
      size="small"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : ''}
      onFocus={handleFocus}
    />
  )
}

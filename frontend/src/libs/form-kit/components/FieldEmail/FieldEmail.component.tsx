import { Field, useField } from 'formik'

import { InputTextField } from 'libs/form-kit/components/InpuTextField/InputTextField.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const FieldEmail = () => {
  const [field, meta, helpers] = useField<string>('email')

  const { t } = useTranslations()

  const handleFocus = () => {
    helpers.setTouched(false, false)
  }

  return (
    <Field
      component={InputTextField}
      name="email"
      type="email"
      label={t({ id: 'emailAddress' })}
      value={field.value}
      size="small"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : ''}
      onFocus={handleFocus}
    />
  )
}

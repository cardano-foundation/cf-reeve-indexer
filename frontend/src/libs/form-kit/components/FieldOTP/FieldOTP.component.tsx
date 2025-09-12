import { Field, useField } from 'formik'

import { InputTextField } from 'libs/form-kit/components/InpuTextField/InputTextField.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldOTPProps {
  name?: string
}

export const FieldOTP = ({ name }: FieldOTPProps) => {
  const [field, meta, helpers] = useField<string>(name ?? 'otp')

  const { t } = useTranslations()

  const handleFocus = () => {
    helpers.setTouched(false, false)
  }

  return (
    <Field
      component={InputTextField}
      name={name ?? 'otp'}
      label={t({ id: name ?? 'otp' })}
      value={field.value}
      size="small"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : t({ id: 'otpHelperText' })}
      onFocus={handleFocus}
    />
  )
}

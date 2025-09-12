import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputTextarea } from 'libs/ui-kit/components/InputTextarea/InputTextarea.component.tsx'

interface FieldTransactionNumbersProps {
  isDisabled?: boolean
}

export const FieldTransactionNumbers = ({ isDisabled = false }: FieldTransactionNumbersProps) => {
  const [field, meta, helpers] = useField<string>('transactionNumbers')

  const { t } = useTranslations()

  const handleFocus = () => {
    helpers.setTouched(false, false)
  }

  return (
    <InputTextarea
      name={field.name}
      label={t({ id: 'transactionNumbers' })}
      type="textarea"
      placeholder="LOB123, CF456"
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error ? meta.error : t({ id: 'importTransactionNumbersHelperText' })}
      onBlur={field.onBlur}
      onChange={field.onChange}
      onFocus={handleFocus}
      disabled={isDisabled}
    />
  )
}

import { useField } from 'formik'
import { FocusEvent } from 'react'

import { InputNumeric } from 'libs/form-kit/components/InputNumeric/InputNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { formatToFloatReadyFormat } from 'modules/public-reports/utils/format.ts'

export const FieldMaxAmount = () => {
  const [field, meta, helpers] = useField<string>('maxAmount')

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) return

    const value = formatToFloatReadyFormat(event.target.value)

    field.onBlur('maxAmount')
    helpers.setTouched(true)
    helpers.setValue(formatNumber(parseFloat(value)))
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) return

    const value = formatToFloatReadyFormat(event.target.value)

    helpers.setValue(parseFloat(value).toFixed(2).toString())
  }

  return (
    <InputNumeric
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={t({ id: 'maxAmount' })}
      name={field.name}
      value={field.value}
      onBlur={handleBlur}
      onChange={field.onChange}
      onFocus={handleFocus}
      isRegular
    />
  )
}

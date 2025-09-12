import { useField } from 'formik'
import { FocusEvent } from 'react'

import { InputNumeric } from 'libs/form-kit/components/InputNumeric/InputNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { formatToFloatReadyFormat } from 'modules/report-type/utils/format.ts'

interface FieldBalanceLCYProps {
  currency?: string
  disabled?: boolean
}

export const FieldBalanceLCY = ({ currency, disabled }: FieldBalanceLCYProps) => {
  const [field, meta, helpers] = useField<string>('balanceLCY')

  const { t } = useTranslations()

  const hasError = meta.touched && Boolean(meta.error)

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const value = formatToFloatReadyFormat(event.target.value)

    field.onBlur(field.name)
    helpers.setTouched(true)
    helpers.setValue(formatNumber(parseFloat(value)))
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    const value = formatToFloatReadyFormat(event.target.value)

    helpers.setValue(parseFloat(value).toFixed(2).toString())
  }

  return (
    <InputNumeric
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      label={t({ id: 'balanceLCY' })}
      name={field.name}
      value={field.value}
      onBlur={handleBlur}
      onChange={field.onChange}
      onFocus={handleFocus}
      disabled={disabled}
      InputProps={{ startAdornment: currency }}
      isRegular
    />
  )
}

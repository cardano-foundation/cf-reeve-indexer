import { useField } from 'formik'
import { FocusEvent } from 'react'

import { RATE_VALUE_REGEX } from 'libs/const/regexp.ts'
import { InputNumeric } from 'libs/form-kit/components/InputNumeric/InputNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { formatToFloatReadyFormat } from 'modules/report-type/utils/format.ts'

interface FieldRateProps {
  disabled?: boolean
}

export const FieldRate = ({ disabled }: FieldRateProps) => {
  const [field, meta, helpers] = useField('rate')

  const { t } = useTranslations()

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const value = formatToFloatReadyFormat(event.target.value)

    field.onBlur('rate')
    helpers.setValue(formatNumber(parseFloat(value)))
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    const value = formatToFloatReadyFormat(event.target.value)

    helpers.setValue(parseFloat(value).toFixed(2).toString())
  }

  const hasError = meta.touched && Boolean(meta.error)

  return (
    <InputNumeric
      id={field.name}
      error={hasError}
      helperText={hasError ? meta.error : ''}
      name={field.name}
      label={`${t({ id: 'rate' })}*`}
      value={field.value}
      valueRegex={RATE_VALUE_REGEX}
      onBlur={handleBlur}
      onChange={field.onChange}
      onFocus={handleFocus}
      disabled={disabled}
      isRegular
    />
  )
}

import { useField, useFormikContext } from 'formik'
import { FocusEvent, useEffect } from 'react'

import { FieldForeignCurrency } from 'libs/form-kit/components/FieldForeignCurrency/FieldForeignCurrency.component.tsx'
import { InputNumeric } from 'libs/form-kit/components/InputNumeric/InputNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { ChartOfAccountFormValues } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.types'
import { formatToFloatReadyFormat } from 'modules/report-type/utils/format.ts'

interface FieldBalanceFCYProps {
  items: SelectOption[]
  disabled?: boolean
  hasAdornment?: boolean
}

export const FieldBalanceFCY = ({ items, disabled = false, hasAdornment }: FieldBalanceFCYProps) => {
  const [field, meta, helpers] = useField<string>('balanceFCY')

  const { values, setFieldValue } = useFormikContext<ChartOfAccountFormValues>()

  useEffect(() => {
    if (values.hasBalance === true && values.currency) {
      setFieldValue('originalCurrencyIdFCY', values.currency)
    }
  }, [values.hasBalance, values.currency, setFieldValue])

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
      label={t({ id: 'balanceFCY' })}
      name={field.name}
      value={field.value}
      onBlur={handleBlur}
      onChange={field.onChange}
      onFocus={handleFocus}
      disabled={disabled}
      InputProps={{ startAdornment: <FieldForeignCurrency items={items} disabled={disabled} isAdornment={hasAdornment} /> }}
      isRegular
    />
  )
}

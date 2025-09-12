import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldBalanceTypeProps {
  disabled: boolean
}

export const FieldBalanceType = ({ disabled }: FieldBalanceTypeProps) => {
  const [field] = useField<string>('balanceType')

  const { t } = useTranslations()

  return (
    <RadioGroup aria-labelledby="balance-type" id={field.name} name={field.name} value={field.value} onBlur={field.onBlur} onChange={field.onChange} row>
      <FormControlLabel control={<Radio />} label={t({ id: 'debit' })} value="DEBIT" disabled={disabled} />
      <FormControlLabel control={<Radio />} label={t({ id: 'credit' })} value="CREDIT" disabled={disabled} />
    </RadioGroup>
  )
}

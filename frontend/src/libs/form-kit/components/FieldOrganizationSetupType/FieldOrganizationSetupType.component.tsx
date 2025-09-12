import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldOrganizationSetupTypeProps {
  disabled: boolean
}

export const FieldOrganizationSetupType = ({ disabled }: FieldOrganizationSetupTypeProps) => {
  const [field] = useField<string>('setupType')

  const { t } = useTranslations()

  return (
    <RadioGroup aria-labelledby="setup-type" id={field.name} name={field.name} value={field.value} onBlur={field.onBlur} onChange={field.onChange}>
      <FormControlLabel control={<Radio />} label={t({ id: 'chartOfAccounts' })} value="CHART_OF_ACCOUNTS" disabled={disabled} />
      <FormControlLabel control={<Radio />} label={t({ id: 'costCenters' })} value="COST_CENTERS" disabled={disabled} />
      <FormControlLabel control={<Radio />} label={t({ id: 'vatCodes' })} value="VAT_CODES" disabled={disabled} />
      <FormControlLabel control={<Radio />} label={t({ id: 'eventCodes' })} value="EVENT_CODES" disabled={disabled} />
      <FormControlLabel control={<Radio />} label={t({ id: 'referenceCodes' })} value="REFERENCE_CODES" disabled={disabled} />
    </RadioGroup>
  )
}

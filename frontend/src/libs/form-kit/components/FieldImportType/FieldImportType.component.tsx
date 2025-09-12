import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import { useField } from 'formik'

interface FieldBalanceTypeProps {
  label: string
  value: string
  disabled?: boolean
}

export const FieldImportType = ({ label, value, disabled }: FieldBalanceTypeProps) => {
  const [field] = useField<string>('importType')

  return (
    <FormControlLabel
      control={<Radio name={field.name} value={value} onBlur={field.onBlur} onChange={field.onChange} checked={field.value === value} disabled={disabled} />}
      label={label}
    />
  )
}

import FormControlLabel from '@mui/material/FormControlLabel'
import { useField } from 'formik'

import { Checkbox } from 'features/mui/base'

import type { FieldCheckboxProps } from './field-checkbox.types'

export const FieldCheckbox = ({ label, name, disabled, ...props }: FieldCheckboxProps) => {
  const [field] = useField<boolean>({ name, type: 'checkbox' })

  return (
    <FormControlLabel
      control={<Checkbox name={field.name} checked={field.checked} onBlur={field.onBlur} onChange={field.onChange} {...{ disabled, ...props }} />}
      label={label}
      disabled={disabled}
    />
  )
}

import type { CheckboxProps } from 'features/mui/base'

export interface FieldCheckboxProps extends CheckboxProps {
  name: NonNullable<CheckboxProps['name']>
  label: string
}

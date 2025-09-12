import { type SelectProps as SelectMUIProps } from '@mui/material/Select'

export interface SelectOption {
  label: string
  value: string
}

export type SelectProps = SelectMUIProps

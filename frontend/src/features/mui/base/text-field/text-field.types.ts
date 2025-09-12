import { type TextFieldProps as TextFieldMUIProps } from '@mui/material/TextField'

export type TextFieldProps = Omit<TextFieldMUIProps, 'select'>

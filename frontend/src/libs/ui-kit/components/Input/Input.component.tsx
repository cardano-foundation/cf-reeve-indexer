import { TextFieldProps as TextFieldPropsMUI } from '@mui/material/TextField'

import { InputStyled } from 'libs/ui-kit/components/Input/Input.styles.tsx'

type InputProps = TextFieldPropsMUI

export const Input = ({ inputRef, label, name, type, ...props }: InputProps) => {
  return <InputStyled id={name} inputRef={inputRef} label={label} name={name} type={type} size="small" {...props} />
}

import { CheckboxStyled, CheckedIconStyled, IconStyled, IndeterminateIconStyled } from './checkbox.styles'
import type { CheckboxProps } from './checkbox.types'

export const Checkbox = ({ name, size = 'medium', onClick, checked, disabled, ...props }: CheckboxProps) => {
  return (
    <CheckboxStyled
      checkedIcon={<CheckedIconStyled />}
      icon={<IconStyled />}
      indeterminateIcon={<IndeterminateIconStyled />}
      id={name}
      {...{ name, size, onClick, checked, disabled, ...props }}
    />
  )
}

import { useTheme } from '@mui/material'
import CheckboxMUI, { CheckboxProps as CheckboxMUIProps } from '@mui/material/Checkbox'
import { MinusSquare, Stop, TickSquare } from 'iconsax-react'

interface CheckboxProps extends CheckboxMUIProps {}

export const Checkbox = ({ onClick, checked, disabled, ...props }: CheckboxProps) => {
  const theme = useTheme()

  return (
    <CheckboxMUI
      icon={<Stop color={theme.palette.common.black} variant="Outline" size={20} />}
      checkedIcon={<TickSquare color={theme.palette.common.black} variant="Bold" size={20} />}
      indeterminateIcon={<MinusSquare color={theme.palette.common.black} variant="Bold" size={20} />}
      sx={{ margin: theme.spacing(0, 1, 0, 0) }}
      onClick={onClick}
      checked={checked}
      disabled={disabled}
      {...props}
    />
  )
}

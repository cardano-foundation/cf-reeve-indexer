import IconButton, { IconButtonProps as IconButtonPropsMUI } from '@mui/material/IconButton'
import { ArrowLeft } from 'iconsax-react'
import { LinkProps } from 'react-router-dom'

interface ButtonBackProps extends IconButtonPropsMUI {
  replace?: LinkProps['replace']
  state?: LinkProps['state']
  to?: LinkProps['to']
}

export const ButtonBack = ({ ...props }: ButtonBackProps) => {
  return (
    <IconButton {...props}>
      <ArrowLeft size={24} />
    </IconButton>
  )
}

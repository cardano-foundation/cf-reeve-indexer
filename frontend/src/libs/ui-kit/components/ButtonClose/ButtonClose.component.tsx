import Box from '@mui/material/Box'
import IconButton, { IconButtonProps as IconButtonPropsMUI } from '@mui/material/IconButton'
import { Add } from 'iconsax-react'
import { LinkProps } from 'react-router-dom'

interface ButtonBackProps extends IconButtonPropsMUI {
  replace?: LinkProps['replace']
  to?: LinkProps['to']
}

export const ButtonClose = ({ ...props }: ButtonBackProps) => {
  return (
    <IconButton {...props}>
      <Box alignItems="center" display="flex" justifyContent="center" sx={{ transform: 'rotate(45deg)' }}>
        <Add size={32} variant="Outline" />
      </Box>
    </IconButton>
  )
}

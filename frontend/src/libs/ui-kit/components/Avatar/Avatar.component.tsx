import { AvatarProps as AvatarMUIProps } from '@mui/material/Avatar'

import { AvatarStyled } from 'libs/ui-kit/components/Avatar/Avatar.styles.tsx'

interface AvatarProps extends AvatarMUIProps {}

export const Avatar = ({ children, alt, src, ...props }: AvatarProps) => {
  return (
    <AvatarStyled src={src} alt={alt} {...props}>
      {children}
    </AvatarStyled>
  )
}

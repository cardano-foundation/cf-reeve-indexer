import { AvatarProps as AvatarMUIProps } from '@mui/material/Avatar'

import { AvatarStyled } from 'libs/ui-kit/components/Avatar/Avatar.styles.tsx'

interface AvatarProps extends AvatarMUIProps {
  background?: string
}

export const Avatar = ({ children, alt, src, background, ...props }: AvatarProps) => {
  return (
    <AvatarStyled src={src} alt={alt} $background={background} {...props}>
      {children}
    </AvatarStyled>
  )
}

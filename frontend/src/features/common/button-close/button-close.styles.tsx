import { styled } from 'styled-components'

import { IconsaxIcon, ICONSAX_NAMES } from 'features/iconsax'
import { IconButton } from 'features/mui/base'

import type { ButtonCloseProps, CloseIconStyledProps } from './button-close.types'

export const ButtonCloseStyled = styled(IconButton)<ButtonCloseProps>``

export const CloseIconStyled = styled((props: CloseIconStyledProps) => <IconsaxIcon name={ICONSAX_NAMES.ADD} size={32} variant="Outline" {...props} />)`
  && {
    transform: rotate(45deg);
  }
`

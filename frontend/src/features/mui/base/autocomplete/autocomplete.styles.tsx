import { ArrowDown2 } from 'iconsax-react'
import { styled } from 'styled-components'

export const PopupIconStyled = styled(() => <ArrowDown2 size={20} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

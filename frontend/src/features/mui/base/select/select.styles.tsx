import SelectMUI from '@mui/material/Select'
import { ArrowDown2 } from 'iconsax-react'
import { styled } from 'styled-components'

import { SelectProps } from './select.types'

export const SelectStyled = styled(SelectMUI)<SelectProps>(
  ({ theme }) => `
  && {
    background: ${theme.palette.background.default};
    border-radius: ${theme.shape.borderRadius * 2}px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  }
`
)

export const IconStyled = styled(({ className }: { className: string }) => <ArrowDown2 className={className} size={20} variant="Outline" />)(
  ({ theme }) => `
  && {
    top: calc(50% - 0.625rem);
    right: 0.5rem;
    color: ${theme.palette.action.active};
  }
`
)

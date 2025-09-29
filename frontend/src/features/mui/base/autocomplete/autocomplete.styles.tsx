import AutocompleteMUI from '@mui/material/Autocomplete'
import { ArrowDown2 } from 'iconsax-react'
import { styled } from 'styled-components'

import type { AutocompleteOption, AutocompleteProps } from './autocomplete.types'

export const AutocompleteStyled = styled(AutocompleteMUI)<AutocompleteProps<AutocompleteOption, boolean, boolean, boolean, 'div'>>``

export const PopupIconStyled = styled(() => <ArrowDown2 size={20} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

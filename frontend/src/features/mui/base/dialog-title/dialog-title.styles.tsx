import DialogTitleMUI from '@mui/material/DialogTitle'
import { styled } from 'styled-components'

import type { DialogTitleProps } from './dialog-title.types'

export const DialogTitleStyled = styled(DialogTitleMUI)<DialogTitleProps>(
  () => `
    && {
      padding: 0;
    }
  `
)

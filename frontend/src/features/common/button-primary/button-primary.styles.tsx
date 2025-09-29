import { styled } from 'styled-components'

import { Button } from 'features/mui/base'

import type { ButtonPrimaryProps } from './button-primary.types'

export const ButtonPrimaryStyled = styled(Button)<ButtonPrimaryProps>(
  ({ theme }) => `
  && {
    padding: ${theme.spacing(0.75, 2)};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    &:hover {
      background: ${theme.palette.primary.light};
    }

    &:disabled {
      box-shadow: none;
    }
  }
`
)

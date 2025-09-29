import { styled } from 'styled-components'

import { Button } from 'libs/ui-kit/components/Button/Button.component.tsx'

export const ButtonPrimaryStyled = styled(Button)`
  && {
    padding: ${({ theme }) => theme.spacing(0.75, 2)};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    &:hover {
      background-color: ${({ theme }) => theme.palette.primary.light};
    }

    &:disabled {
      box-shadow: none;
    }
  }
`

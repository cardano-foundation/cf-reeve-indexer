import { styled } from 'styled-components'

import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'

export const AttestationButtonStyled = styled(ButtonIcon)`
  &&& {
    padding: ${({ theme }) => theme.spacing(0.5)};
  }
`

import { styled } from 'styled-components'

import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

export const CounterChipStyled = styled(Chip)`
  && {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`

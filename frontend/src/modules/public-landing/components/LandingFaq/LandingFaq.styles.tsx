import Accordion from '@mui/material/Accordion'
import { styled } from 'styled-components'

export const FaqAccordionStyled = styled(Accordion)`
  && {
    background: ${({ theme }) => theme.palette.common.white};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};

    &::before {
      display: none;
    }
  }
`

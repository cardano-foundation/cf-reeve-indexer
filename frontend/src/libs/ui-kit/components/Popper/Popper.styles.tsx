import Popper from '@mui/material/Popper'
import { styled } from 'styled-components'

export const PopperStyled = styled(Popper)`
  && {
    & .MuiPaper-root {
      min-width: unset;
      background: ${({ theme }) => theme.palette.background.default};
      border-radius: 0.5rem;
      box-shadow: 0 4px 16px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
  }
`

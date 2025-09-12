import Box from '@mui/material/Box'
import { styled } from 'styled-components'

interface LogoContainerStyledProps {
  $isSidebarOpen: boolean
}

export const LogoContainerStyled = styled(Box)<LogoContainerStyledProps>`
  && {
    display: flex;
    width: 100%;
    padding: ${({ theme, $isSidebarOpen }) => ($isSidebarOpen ? theme.spacing(3, 4) : theme.spacing(3, 1))};
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(0.5)};
  }
`

interface LogoStyledProps {
  $isSidebarOpen: boolean
}

export const LogoStyled = styled(Box)<LogoStyledProps>`
  && {
    display: flex;
    width: 4rem;
    align-items: center;
    justify-self: center;

    & svg {
      width: 100%;
    }
  }
`

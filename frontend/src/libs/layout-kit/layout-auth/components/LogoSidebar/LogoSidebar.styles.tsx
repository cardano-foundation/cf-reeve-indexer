import Box from '@mui/material/Box'
import { styled } from 'styled-components'

interface LogoContainerStyledProps {
  $isSidebarOpen: boolean
}

export const LogoContainerStyled = styled(Box)<LogoContainerStyledProps>`
  && {
    display: flex;
    height: 7rem;
    padding: ${({ theme }) => theme.spacing(3)} ${({ $isSidebarOpen }) => ($isSidebarOpen ? '1.5rem' : '0.5rem')};
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    transition: padding 0.3s ease-in-out;

    ${({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        height: 6rem;
      }
    `}
  }
`

interface LogoStyledProps {
  $isSidebarOpen: boolean
}

export const LogoStyled = styled.span<LogoStyledProps>`
  && {
    transform: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'scale(1)' : 'scale(0.67)')};
    transform-origin: left;
    transition: transform 0.3s ease-in-out;
  }
`

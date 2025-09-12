import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { styled } from 'styled-components'

interface IconButtonStyledProps {
  $isSidebarOpen: boolean
}

export const IconButtonStyled = styled(IconButton)<IconButtonStyledProps>`
  && {
    position: fixed;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'calc(20rem - 1.375rem)' : 'calc(5.5rem - 1.375rem)')};
    top: 5.625rem;
    z-index: 10;
    transition: left 0.3s ease-in-out;

    ${({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        top: 4.625rem;
      }
    `}

    @media (max-height: 37.5rem) {
      top: 4.625rem;
    }
  }
`

export const IconWrapperStyled = styled(Box)`
  && {
    display: flex;
    width: 1.25rem;
    height: 1.25rem;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.palette.divider};
    border-radius: 50%;
  }
`

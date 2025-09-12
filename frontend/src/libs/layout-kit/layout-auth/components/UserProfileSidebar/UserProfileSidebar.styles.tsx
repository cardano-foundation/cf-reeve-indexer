import Box from '@mui/material/Box'
import { styled } from 'styled-components'

interface UserProfileStyledProps {
  $isSidebarOpen: boolean
}

export const UserProfileStyled = styled(Box)<UserProfileStyledProps>`
  && {
    display: flex;
    width: 100%;
    height: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '5.25rem' : '7.5rem')};
    padding: ${({ theme }) => theme.spacing(1, 3)};
    align-items: center;
    flex-direction: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'row' : 'column-reverse')};
    border-top: ${({ theme }) => `1px solid ${theme.palette.divider}`};
  }
`

interface TextContainerStyledProps {
  $isSidebarOpen: boolean
}

export const TextContainerStyled = styled(Box)<TextContainerStyledProps>`
  && {
    display: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'block' : 'none')};
  }
`

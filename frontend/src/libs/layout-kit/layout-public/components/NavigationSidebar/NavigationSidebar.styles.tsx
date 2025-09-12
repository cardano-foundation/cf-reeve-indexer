import Box from '@mui/material/Box'
import List from '@mui/material/List'
import { styled } from 'styled-components'

export const NavigationStyled = styled(Box)`
  && {
    width: 100%;
    flex: 1;
    padding: ${({ theme }) => theme.spacing(2)};
    overflow: hidden auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

export const ListStyled = styled(List)`
  && {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    gap: ${({ theme }) => theme.spacing(0.5)};
  }
`

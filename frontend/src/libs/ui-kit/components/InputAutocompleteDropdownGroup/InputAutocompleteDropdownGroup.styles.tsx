import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListSubheader from '@mui/material/ListSubheader'
import { styled } from 'styled-components'

export const ListSubheaderStyled = styled(ListSubheader)`
  && {
    position: unset;
    height: 2.25rem;
    padding: ${({ theme }) => theme.spacing(0, 1.5)};
    background: ${({ theme }) => theme.palette.background.default};
  }
`

export const ListItemStyled = styled(ListItem)`
  && {
    margin: 0;
    padding: 0;
  }
`

export const ListStyled = styled(List)`
  && {
    width: 100%;
    padding: 0;
  }
`

import Snackbar from '@mui/material/Snackbar'
import { styled } from 'styled-components'

export const SnackbarStyled = styled(Snackbar)`
  && {
    max-width: 30rem;
    width: 100%;

    & .MuiSnackbarContent-root {
      width: 100%;
      display: flex;
      align-items: center;
      flex-flow: row nowrap;
      gap: ${({ theme }) => theme.spacing(1)};
      background: ${({ theme }) => theme.palette.primary.main};
      border-radius: ${({ theme }) => `${theme.shape.borderRadius * 3}px`};
    }

    & .MuiSnackbarContent-message {
      flex: 1;

      & svg {
        display: flex;
        flex: 1 0 auto;
      }

      & .MuiBox-root {
        flex: 1 1 100%;
      }
    }

    & .MuiSnackbarContent-action {
      margin: 0;
      padding: 0;
    }

    ${({ theme }) => theme.breakpoints.down('sm')} {
      max-width: 100%;
      width: auto;
      bottom: 5rem;
    }
  }
`

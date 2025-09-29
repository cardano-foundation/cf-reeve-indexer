import Box from '@mui/material/Box'
import { Form } from 'formik'
import { styled } from 'styled-components'

export const OrganisationFormSidebarStyled = styled(Box)`
  && {
    display: flex;
    width: 100%;
    height: 7rem;
    padding: ${({ theme }) => theme.spacing(3, 2, 3, 1)};
    align-items: center;
    justify-content: center;
  }
`

export const OrganisationsFormStyled = styled(Form)`
  && {
    width: 100%;
  }
`

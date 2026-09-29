import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { Form } from 'formik'
import { styled } from 'styled-components'

interface OrganisationFormSidebarStyledProps extends BoxPropsMUI {
  $isMobile: boolean
}

export const OrganisationFormSidebarStyled = styled(Box)<OrganisationFormSidebarStyledProps>`
  && {
    display: flex;
    width: 100%;
    height: ${({ $isMobile }) => ($isMobile ? 'auto' : '7rem')};
    padding: ${({ theme, $isMobile }) => ($isMobile ? theme.spacing(0.5, 0) : theme.spacing(3, 2, 3, 1))};
    align-items: center;
    justify-content: center;
  }
`

export const OrganisationsFormStyled = styled(Form)`
  && {
    width: 100%;
  }
`

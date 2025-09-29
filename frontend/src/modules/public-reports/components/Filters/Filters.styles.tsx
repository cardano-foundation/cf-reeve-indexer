import { Form } from 'formik'
import { styled } from 'styled-components'

export const FormStyled = styled(Form)`
  && {
    display: flex;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(2)};
  }
`

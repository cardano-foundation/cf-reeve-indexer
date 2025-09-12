import { styled } from 'styled-components'

export const LoginFormStyled = styled.div`
  margin: 0 auto;
  max-width: 516px;
  padding: ${({ theme }) => theme.spacing(5, 6)};
  background-color: ${({ theme }) => theme.palette.common.white};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1);

  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: ${({ theme }) => theme.spacing(5, 4)};
  }
`

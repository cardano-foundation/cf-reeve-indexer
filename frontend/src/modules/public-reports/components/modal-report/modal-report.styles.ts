import { Grid } from 'features/mui/base'
import styled from 'styled-components'

export const ContentStyled = styled(Grid)(
  ({ theme }) => `
  && {
    padding: ${theme.spacing(3)};
    background: ${theme.palette.background.default};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${Number(theme.shape.borderRadius) * 2}px;
  }
`
)
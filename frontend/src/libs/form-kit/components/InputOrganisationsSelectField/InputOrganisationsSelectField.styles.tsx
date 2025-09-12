import Typography, { TypographyProps as TypographyPropsMUI } from '@mui/material/Typography'
import { styled } from 'styled-components'

export const OrganisationLogoStyled = styled.img`
  && {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 4px;
  }
`

export const OrganisationLabelStyled = styled(Typography)<TypographyPropsMUI>`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

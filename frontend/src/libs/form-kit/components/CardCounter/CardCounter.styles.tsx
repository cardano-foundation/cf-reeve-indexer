import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { styled } from 'styled-components'

export const CardStyled = styled(Card)`
  && {
    min-width: 17rem;
    width: 100%;
    height: 3.5rem;
    border: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  }
`

export const CardActionAreaStyled = styled(CardActionArea)`
  && {
    display: flex;
    height: 100%;
    background: ${({ theme }) => theme.palette.common.white};
  }
`

export const CardContentStyled = styled(CardContent)`
  && {
    display: flex;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(1, 1, 1, 2)};
    align-items: center;
    justify-content: space-between;
  }
`

interface ContentStyledProps extends BoxPropsMUI {
  $isDisabled: boolean
}

export const ContentStyled = styled(Box)<ContentStyledProps>`
  && {
    width: 100%;
    padding: 0;
  }
`

export const IconContentStyled = styled(Box)`
  && {
    width: 2.5rem;
    height: 2.5rem;
    padding: ${({ theme }) => theme.spacing(1)};
    flex: 1 0 auto;
  }
`

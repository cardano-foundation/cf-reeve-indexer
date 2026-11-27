import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import { styled } from 'styled-components'

export const ReportCardListStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: ${({ theme }) => theme.spacing(1.5)};
    margin: 0;
    padding: 0;
    list-style: none;
    transition: opacity 0.2s ease-in-out;

    &[aria-busy='true'] {
      opacity: 0.5;
    }

    ${({ theme }) => theme.breakpoints.up(800)} {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`

export const ReportCardStyled = styled(Box)<BoxPropsMUI>`
  && {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.palette.common.white};
  }
`

export const ReportCardActionStyled = styled(CardActionArea)`
  && {
    position: static;
    width: auto;
    border-radius: 0;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: ${({ theme }) => theme.spacing(1)};
    }

    .MuiCardActionArea-focusHighlight {
      display: none;
    }

    .MuiTouchRipple-root {
      border-radius: ${({ theme }) => theme.spacing(1)};
    }

    &.Mui-focusVisible::after {
      outline: 2px solid ${({ theme }) => theme.palette.primary.main};
      outline-offset: 2px;
    }
  }
` as typeof CardActionArea

export const ReportCardAttestationsStyled = styled(Box)<BoxPropsMUI>`
  && {
    position: relative;
    z-index: 1;
    align-self: flex-start;
  }
`

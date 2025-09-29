import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { styled } from 'styled-components'

import { opacityColors } from 'libs/ui-kit/theme/colors.ts'
import { sizeMap } from 'modules/dashboard-tool/constants/card.ts'

interface CardStyledProps {
  $size?: 'small' | 'medium' | 'large'
}

export const CardStyled = styled(Card)<CardStyledProps>`
  && {
    min-height: ${({ $size }) => ($size ? sizeMap[$size] : '100%')};
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.palette.background.default};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    ${({ theme, $size }) => `
      ${theme.breakpoints.down('xl')} {
        min-height: initial;
        height: ${$size ? sizeMap[$size] : '100%'};
      }
    `}
  }
`

export const CardActionsStyled = styled(CardActions)`
  && {
    padding: 0;
  }
`

export const CardContentStyled = styled(CardContent)`
  && {
    display: flex;
    min-height: 0;
    width: 100%;
    height: 100%;
    padding: ${({ theme }) => theme.spacing(3)};
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(3)};
  }
`

export const IconStyled = styled(Box)`
  && {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.palette.secondary.main};
    border-radius: 50%;
  }
`

export const MenuStyled = styled(Menu)`
  && {
    & .MuiPaper-root {
      margin: ${({ theme }) => theme.spacing(0.5, 0, 0, 0)};
      padding: ${({ theme }) => theme.spacing(1)};
      background: ${({ theme }) => theme.palette.background.default};
      border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
      box-shadow: 0 4px 16px -1px rgba(0, 0, 0, 0.1);
    }

    & .MuiList-root {
      padding: 0;
    }
  }
`

export const MenuItemStyled = styled(MenuItem)`
  && {
    border-radius: ${({ theme }) => theme.shape.borderRadius * 1.5}px;

    &.Mui-selected {
      background: ${opacityColors.button[4]};

      &.Mui-focusVisible {
        background: ${opacityColors.button[2]};
      }

      &:hover {
        background: ${opacityColors.button[2]};
      }
    }

    &.Mui-focusVisible {
      background: ${opacityColors.button[2]};
    }

    &:hover {
      background: ${opacityColors.button[2]};
    }
  }
`

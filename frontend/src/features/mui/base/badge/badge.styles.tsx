import BadgeMUI from '@mui/material/Badge'
import { styled } from 'styled-components'

import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

import { BadgeProps } from './badge.types'

export const BadgeStyled = styled(BadgeMUI)<BadgeProps>(
  ({ theme }) => `
  && {
    color: ${theme.palette.common.white};

    & .MuiBadge-standard {
      border-radius: ${Number(theme.shape.borderRadius) * 1.5}px;

      &.MuiBadge-colorSuccess {
        background: ${paletteColors.green[700]};
      }
    }

    & .MuiBadge-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;

      &.MuiBadge-colorSuccess {
        background: ${paletteColors.green[700]};
      }
    }
  }
`
)

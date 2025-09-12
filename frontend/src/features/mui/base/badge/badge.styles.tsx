import BadgeMUI from '@mui/material/Badge'
import { styled } from 'styled-components'

import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

import { BadgeProps } from './badge.types'

export const BadgeStyled = styled(BadgeMUI)<BadgeProps>(
  ({ theme }) => `
  && {
    & .MuiBadge-badge {
      background: ${paletteColors.blue[700]};
      border-radius: ${theme.shape.borderRadius * 1.5}px;
      color: ${theme.palette.common.white};
    }
  }
`
)

import Chip, { ChipProps as ChipPropsMUI } from '@mui/material/Chip'
import { styled } from 'styled-components'

import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

export const ChipStyled = styled(Chip)<ChipPropsMUI>`
  && {
    padding: ${({ theme }) => theme.spacing(0.375, 1)};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 1.5}px;

    &.MuiChip-outlined {
      &.MuiChip-colorDefault {
        color: ${({ theme }) => theme.palette.text.primary};
        background: ${paletteColors.neutral[100]};
      }

      &.MuiChip-outlinedDefault {
        border: 1px solid ${({ theme }) => theme.palette.divider};
      }

      &.MuiChip-colorSecondary {
        color: ${paletteColors.purple[800]};
        background: ${paletteColors.purple[50]};
      }

      &.MuiChip-outlinedSecondary {
        border: 1px solid ${paletteColors.purple[300]};
      }

      &.MuiChip-colorSuccess {
        color: ${paletteColors.green[800]};
        background: ${paletteColors.green[50]};
      }

      &.MuiChip-outlinedSuccess {
        border: 1px solid ${paletteColors.green[300]};
      }

      &.MuiChip-colorWarning {
        color: ${paletteColors.orange[800]};
        background: ${paletteColors.orange[50]};
      }

      &.MuiChip-outlinedWarning {
        border: 1px solid ${paletteColors.orange[200]};
      }
    }

    & .MuiChip-label {
      padding: 0;
    }

    & .MuiChip-deleteIcon {
      margin: ${({ theme }) => theme.spacing(0, 0, 0, 0.5)};
    }
  }
`

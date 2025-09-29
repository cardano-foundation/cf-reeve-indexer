import { styled } from 'styled-components'

import { Box, ListItem } from 'features/mui/base'
import { opacityColors } from 'libs/ui-kit/theme/colors'

export const ListItemStyled = styled(ListItem)(
  ({ theme }) => `
  && {
    display: flex;
    margin: ${theme.spacing(0, 0, 0.5)};
    padding: ${theme.spacing(0.5)};
    gap: ${theme.spacing(0.5)};
    border-radius: ${theme.shape.borderRadius * 1.5}px;

    &:last-of-type {
      margin: 0;
    }

    &:active {
      background: ${opacityColors.button[2]};
    }

    &.Mui-focused {
      background: ${opacityColors.button[2]};
    }

    &.Mui-focusVisible {
      background: ${opacityColors.button[2]};
    }

    &[aria-selected="true"] {
      background: ${opacityColors.button[4]};

      &.Mui-focused {
        background: ${opacityColors.button[2]};
      }
    }
  }
`
)

export const PaperStyled = styled(Box)(
  ({ theme }) => `
  && {
    background: ${theme.palette.background.default};
    border-radius: ${theme.shape.borderRadius * 2}px;
    box-shadow: 0 4px 16px -1px rgba(0, 0, 0, 0.1);
  }
`
)

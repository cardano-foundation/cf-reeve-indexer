import { styled } from 'styled-components'

import { Box, List, ListItem, ListSubheader } from 'features/mui/base'
import { opacityColors } from 'libs/ui-kit/theme/colors'

import type { ListItemStyledProps } from './combobox.types'

export const ListItemStyled = styled(ListItem)<ListItemStyledProps>(
  ({ theme, $isMultiple }) => `
  && {
    &.MuiListItem-root {
      display: flex;
      height: 3.125rem;
      margin: ${theme.spacing(0, 0, 0.5)};
      padding: ${!$isMultiple ? theme.spacing(0.5, 1) : theme.spacing(0.5)};
      gap: ${theme.spacing(0.5)};
      border-radius: ${theme.shape.borderRadius * 1.5}px;
    }

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

export const ListSubheaderStyled = styled(ListSubheader)(
  ({ theme }) => `
  && {
    position: unset;
    height: 2.25rem;
    padding: ${theme.spacing(0, 1.5)};
    background: ${theme.palette.background.default};
  }
`
)

export const ListItemGroupedStyled = styled(ListItem)`
  && {
    margin: 0;
    padding: 0;
  }
`

export const ListStyled = styled(List)`
  && {
    width: 100%;
    padding: 0;
  }
`

export const PaperStyled = styled(Box)(
  ({ theme }) => `
  && {
    background: ${theme.palette.background.default};
    border-radius: ${theme.shape.borderRadius * 2}px;
    box-shadow: 0 4px 16px -1px rgba(0, 0, 0, 0.1);
  }
`
)

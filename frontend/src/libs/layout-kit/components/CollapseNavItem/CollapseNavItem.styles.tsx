import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { styled } from 'styled-components'

import { opacityColors } from 'libs/ui-kit/theme/colors.ts'

export const ListStyled = styled(List)`
  && {
    display: flex;
    padding: 0;
    flex-flow: column nowrap;
    gap: ${({ theme }) => theme.spacing(0.5)};
  }
`

export const ListItemStyled = styled(ListItem)`
  && {
    padding: 0;
  }
`

export const ListItemButtonStyled = styled(ListItemButton)`
  && {
    padding: ${({ theme }) => theme.spacing(1, 2, 1, 9)};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    text-decoration: none;

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
` as typeof ListItemButton

interface ListItemTextStyledProps {
  $isCurrentPage: boolean
}

export const ListItemTextStyled = styled(ListItemText)<ListItemTextStyledProps>`
  && {
    color: ${({ theme, $isCurrentPage }) => ($isCurrentPage ? theme.palette.common.black : theme.palette.text.secondary)};
    text-wrap: nowrap;
  }
`

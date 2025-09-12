import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { styled } from 'styled-components'

import { opacityColors } from 'libs/ui-kit/theme/colors.ts'

export const ListItemStyled = styled(ListItem)`
  && {
    width: 100%;
    padding: 0;
  }
`

export const ListItemButtonStyled = styled(ListItemButton)`
  && {
    display: flex;
    padding: ${({ theme }) => theme.spacing(1, 1, 1, 2)};
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    overflow: hidden;

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

      & .MuiListItemIcon-root {
        svg {
          transform: scale(1.1667);
        }
      }
    }

    & svg {
      transform: scale(1);
      transition: transform 0.2s ease-in-out;
    }
  }
`

export const ListItemIconStyled = styled(ListItemIcon)`
  && {
    min-width: 0;
  }
`

interface ListItemTextStyledProps {
  $isCurrentPage: boolean
}

export const ListItemTextStyled = styled(ListItemText)<ListItemTextStyledProps>`
  && {
    color: ${({ theme, $isCurrentPage }) => ($isCurrentPage ? theme.palette.common.black : theme.palette.text.secondary)};
    text-wrap: nowrap;
  }
`

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
    padding: ${({ theme }) => theme.spacing(1, 2, 1, 6)};
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
`

export const ListItemIconStyled = styled(ListItemIcon)`
  && {
    min-width: 0;
    margin: ${({ theme }) => theme.spacing(0, 1.5, 0, 0)};
  }
`

export const ListItemTextStyled = styled(ListItemText)`
  && {
    color: ${({ theme }) => theme.palette.text.secondary};
    text-wrap: nowrap;
  }
`

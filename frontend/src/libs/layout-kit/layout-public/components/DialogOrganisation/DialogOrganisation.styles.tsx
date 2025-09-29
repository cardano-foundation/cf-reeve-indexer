import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import { styled } from 'styled-components'

import { opacityColors } from 'libs/ui-kit/theme/colors.ts'

export const ListStyled = styled(List)`
  && {
    padding: 0;
  }
`

export const ListItemStyled = styled(ListItem)`
  && {
    width: 100%;
    padding: 0;
  }
`

export const ListItemButtonStyled = styled(ListItemButton)`
  && {
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1)};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};

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
  }
`

export const ListItemIconStyled = styled(ListItemIcon)`
  && {
    min-width: initial;
  }
`

export const OrganisationLogoStyled = styled.img`
  && {
    width: 2rem;
    height: 2rem;
    border-radius: 4px;
  }
`

import { styled } from 'styled-components'

import { MenuItem, MenuList, Select } from 'features/mui/base'
import { opacityColors } from 'libs/ui-kit/theme/colors'

export const PickerStyled = styled(Select)``

export const ListboxStyled = styled(MenuList)(
  ({ theme }) => `
  && {
    max-height: 11.25rem;
    padding: ${theme.spacing(1)};
  }
`
)

export const MenuItemStyled = styled(MenuItem)(
  ({ theme }) => `
  && {
    display: flex;
    margin: ${theme.spacing(0, 0, 0.5)};
    padding: ${theme.spacing(0.75, 2)};
    gap: ${theme.spacing(0.5)};
    border-radius: ${theme.shape.borderRadius * 1.5}px;

    &:last-of-type {
      margin: 0;
    }

    &:active {
      background: ${opacityColors.button[2]};
    }

    &:hover {
      background: ${opacityColors.button[2]};
    }

    &.Mui-focused {
      background: ${opacityColors.button[2]};
    }

    &.Mui-focusVisible {
      background: ${opacityColors.button[2]};
    }

    &.Mui-selected {
      background: ${opacityColors.button[4]};

      &:hover {
        background: ${opacityColors.button[2]};
      }

      &.Mui-focusVisible {
        background: ${opacityColors.button[2]};
      }
    }
  }
`
)

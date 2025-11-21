import { styled } from 'styled-components'

import { Box, List } from 'features/mui/base'

import type { VirtualizedDropdownListInnerStyledProps, VirtualizedDropdownListOuterStyledProps } from './virtualized-dropdown-list.types'

export const VirtualizedDropdownListStyled = styled(Box)(
  ({ theme }) => `
  && {
    padding: ${theme.spacing(1, 0)};
  }
`
)

export const VirtualizedDropdownListOuterStyled = styled(List)<VirtualizedDropdownListOuterStyledProps>(
  ({ $height }) => `
  && {
    position: relative;
    height: ${$height}px;
  }
`
)

export const VirtualizedDropdownListInnerStyled = styled(Box)<VirtualizedDropdownListInnerStyledProps>(
  ({ theme, $translate }) => `
  && {
    position: absolute;
    width: 100%;
    padding: ${theme.spacing(0, 1)};
    transform: translateY(${$translate}px);
  }
`
)

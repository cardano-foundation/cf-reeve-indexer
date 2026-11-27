import { styled } from 'styled-components'

import { Drawer } from 'features/mui/base'

export const LayoutContentDrawerStyled = styled(Drawer)`
  && {
    max-width: 25rem;
    width: 100%;

    & .MuiDrawer-paper {
      max-width: 25rem;
      width: 100%;
      background-color: ${({ theme }) => theme.palette.background.default};
      overflow: hidden;

      ${({ theme }) => theme.breakpoints.down('smw')} {
        z-index: ${({ theme }) => theme.zIndex.drawer + 2};
      }
    }
  }
`

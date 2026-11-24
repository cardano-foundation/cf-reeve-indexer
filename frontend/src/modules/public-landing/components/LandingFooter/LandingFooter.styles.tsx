import { styled } from 'styled-components'

import { LayoutFooterDesktopStyled } from 'libs/layout-kit/sections/LayoutFooterDesktop/LayoutFooterDesktop.styles.tsx'

export const LandingFooterStyled = styled(LayoutFooterDesktopStyled)`
  && {
    ${({ theme }) => theme.breakpoints.down('sm')} {
      padding: ${({ theme }) => theme.spacing(2)};
    }
  }
`

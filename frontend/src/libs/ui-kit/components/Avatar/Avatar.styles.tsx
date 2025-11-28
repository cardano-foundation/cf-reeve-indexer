import Avatar from '@mui/material/Avatar'
import { styled } from 'styled-components'

import { theme } from 'libs/ui-kit/theme/theme'

export const AvatarStyled = styled(Avatar)`
  && {
    width: 2.5rem;
    height: 2.5rem;
    background: ${theme.palette.primary.main};
    line-height: 1;
  }
`

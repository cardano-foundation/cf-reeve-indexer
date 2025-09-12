import Avatar from '@mui/material/Avatar'
import { styled } from 'styled-components'

import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

export const AvatarStyled = styled(Avatar)`
  && {
    width: 2.5rem;
    height: 2.5rem;
    background: ${paletteColors.blue[700]};
    font-size: ${({ theme }) => theme.typography.body2};
    line-height: 1;
  }
`

import Box from '@mui/material/Box'
import { styled } from 'styled-components'

import { colors } from 'libs/ui-kit/theme/colors.ts'

export const KeysIconStyled = styled.span`
  && {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: ${colors.green[500]};
  }
`

export const KeysNoteStyled = styled(Box)`
  && {
    display: flex;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1, 1.5)};
    border-radius: ${({ theme }) => theme.spacing(1)};
    background: ${colors.yellow[200]};

    & > svg {
      flex: none;
    }
  }
`

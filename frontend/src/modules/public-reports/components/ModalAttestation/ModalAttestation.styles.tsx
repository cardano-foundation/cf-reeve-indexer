import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from 'styled-components'

import { Modal } from 'features/common'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { colors, verifyColors } from 'libs/ui-kit/theme/colors.ts'

export const ModalContentStyled = styled(Modal.Content)`
  &&& {
    padding-top: 0;
  }
`

export const ActionButtonStyled = styled(ButtonIcon)`
  &&& {
    padding: ${({ theme }) => theme.spacing(0.5)};
  }
`

export const KindIconStyled = styled(Box)<{ $isAvailable: boolean }>`
  && {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    color: ${({ $isAvailable }) => ($isAvailable ? verifyColors.blue[600] : colors.neutral[600])};
    background: ${({ theme, $isAvailable }) => ($isAvailable ? verifyColors.blue[50] : theme.palette.action.hover)};
  }
`

export const MonoValueStyled = styled(Typography)`
  && {
    font-family: monospace;
    word-break: break-all;
  }
`

import Alert from '@mui/material/Alert'
import { styled } from 'styled-components'

import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

export const AlertStyled = styled(Alert)`
  && {
    align-items: center;
    border-radius: ${({ theme }) => theme.spacing(1)};

    &.MuiAlert-colorError {
      background: ${paletteColors.red[50]};
      color: ${paletteColors.red[800]};

      & .MuiAlert-icon {
        color: ${paletteColors.red[500]};
      }
    }

    &.MuiAlert-colorInfo {
      background: ${paletteColors.blue[50]};
      color: ${paletteColors.blue[800]};

      & .MuiAlert-icon {
        color: ${({ theme }) => theme.palette.error.main};
      }
    }

    &.MuiAlert-colorSuccess {
      background: ${paletteColors.green[50]};
      color: ${paletteColors.green[800]};

      & .MuiAlert-icon {
        color: ${paletteColors.green[500]};
      }
    }

    &.MuiAlert-colorWarning {
      background: ${paletteColors.orange[50]};
      color: ${paletteColors.orange[800]};

      & .MuiAlert-icon {
        color: ${paletteColors.orange[500]};
      }
    }

    & .MuiAlert-message {
      max-width: 100%;
      width: 100%;
    }
  }
`

import { styled } from 'styled-components'

import { previewWatermark } from 'assets/images'
import { Box } from 'features/mui/base'

export const WatermarkStyled = styled(Box)(
  () => `
  && {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 450px;
    background: url(${previewWatermark});
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    transform: translate(-50%, -50%);
    pointer-events: none;
    opacity: 0.5;
    z-index: 0;
  }
`
)

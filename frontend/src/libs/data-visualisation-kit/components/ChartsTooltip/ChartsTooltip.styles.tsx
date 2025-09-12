import { ChartsTooltip } from '@mui/x-charts'
import { styled } from 'styled-components'

export const ChartsTooltipStyled = styled(ChartsTooltip)`
  && {
    & .MuiChartsTooltip-paper {
      background: ${({ theme }) => theme.palette.background.default};
      border: ${({ theme }) => `1px solid ${theme.palette.divider}`};
      border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
      box-shadow: 0 4px 16px -1px rgba(0, 0, 0, 0.1);
    }

    & .MuiChartsTooltip-labelCell {
      padding: ${({ theme }) => theme.spacing(0, 0, 0, 1.5)};
      vertical-align: middle;
    }

    & .MuiChartsTooltip-valueCell {
      text-align: right;
      vertical-align: middle;
    }
  }
`

import { ChartsLegend } from '@mui/x-charts'
import { styled } from 'styled-components'

export const ChartsLegendStyled = styled(ChartsLegend)`
  && {
    margin: auto 0 0;
    column-gap: ${({ theme }) => theme.spacing(3)};
    row-gap: ${({ theme }) => theme.spacing(1)};
    font-size: ${({ theme }) => theme.typography.body2.fontSize};

    & .MuiChartsLegend-series {
      gap: ${({ theme }) => theme.spacing(0.5)};
    }

    & .MuiChartsLegend-mark {
      width: 1rem;
      height: 1rem;
    }
  }
`

import { type ChartsTooltipProps as ChartsTooltipPropsMUI } from '@mui/x-charts'

import { ChartsTooltipStyled } from 'libs/data-visualisation-kit/components/ChartsTooltip/ChartsTooltip.styles.tsx'

interface ChartsTooltipProps extends ChartsTooltipPropsMUI {}

export const ChartsTooltip = ({ placement = 'top', trigger = 'item', ...props }: ChartsTooltipProps) => {
  return <ChartsTooltipStyled placement={placement} trigger={trigger} {...props} />
}

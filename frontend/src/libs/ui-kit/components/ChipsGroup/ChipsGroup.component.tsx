import Box from '@mui/material/Box'

import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { CounterChipStyled } from 'libs/ui-kit/components/ChipsGroup/ChipsGroup.styles.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

export interface ChipsGroupProps {
  content: string[]
}

export const ChipsGroup = ({ content }: ChipsGroupProps) => {
  const [prefix, ...sufixes] = content

  const count = sufixes.length
  const tooltipLabel = `+${count}`

  return (
    <Box display="flex" gap={0.5}>
      <Chip label={prefix} />
      {count > 0 ? (
        <Tooltip title={[...sufixes].join('\n')}>
          <CounterChipStyled label={tooltipLabel} size="small" />
        </Tooltip>
      ) : null}
    </Box>
  )
}

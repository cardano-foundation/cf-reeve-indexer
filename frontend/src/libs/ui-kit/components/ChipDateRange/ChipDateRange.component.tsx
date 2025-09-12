import { Dayjs } from 'dayjs'

import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { toDayjs } from 'libs/utils/toDayjs'

interface ChipDateRangeProps {
  from: Dayjs
  to: Dayjs
}

export const ChipDateRange = ({ from, to }: ChipDateRangeProps) => {
  const fromLabel = toDayjs(from)?.format('DD/MM/YYYY')
  const toLabel = toDayjs(to)?.format('DD/MM/YYYY')
  return <Chip label={`${fromLabel} – ${toLabel}`} />
}

import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface ChipAmountRangeProps {
  max?: string
  min?: string
}

export const ChipAmountRange = ({ max, min }: ChipAmountRangeProps) => {
  const label = max && min ? `Min: ${min}  –  Max: ${max}` : max ? `Max: ${max}` : `Min: ${min}`

  return <Chip label={label} />
}

import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface ChipListProps {
  items: string[]
}

export const ChipList = ({ items }: ChipListProps) => {
  const label = items.map((item) => item).join(', ')

  return <Chip label={label} />
}

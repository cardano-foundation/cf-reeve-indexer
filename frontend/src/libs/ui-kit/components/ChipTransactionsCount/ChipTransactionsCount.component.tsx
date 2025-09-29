import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface ChipTransactionsCountProps {
  count: number
}

export const ChipTransactionsCount = ({ count }: ChipTransactionsCountProps) => {
  const { t } = useTranslations()

  return <Chip label={t({ id: 'transactionsCount' }, { count })} />
}

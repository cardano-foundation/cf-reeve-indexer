import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface ChipAccountingRegimeProps {
  accountingRegime: string | null
}

export const ChipAccountingRegime = ({ accountingRegime }: ChipAccountingRegimeProps) => {
  const { t } = useTranslations()

  return accountingRegime != null
    ? <Chip color="info" label={t({ id: accountingRegime, defaultMessage: accountingRegime })} />
    : <Chip color="default" label={t({ id: 'legacyReport' })} />
}
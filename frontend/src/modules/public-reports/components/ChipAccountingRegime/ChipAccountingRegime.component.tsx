import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface ChipAccountingRegimeProps {
  accountingRegime: string | null
}

export const ChipAccountingRegime = ({ accountingRegime }: ChipAccountingRegimeProps) => {
  const { t } = useTranslations()

  const regime = accountingRegime?.trim()

  return !regime || regime.toLowerCase() === 'not applicable'
    ? <Chip color="default" label={t({ id: 'unspecified' })} />
    : <Chip color="info" label={t({ id: regime, defaultMessage: regime })} />
}
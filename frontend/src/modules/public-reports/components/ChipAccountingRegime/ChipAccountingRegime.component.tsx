import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { getReportStandard } from 'modules/public-reports/utils/format.ts'

interface ChipAccountingRegimeProps {
  accountingRegime: string | null
}

export const ChipAccountingRegime = ({ accountingRegime }: ChipAccountingRegimeProps) => {
  const { t } = useTranslations()

  const regime = getReportStandard(accountingRegime)

  return !regime
    ? <Chip color="default" label={t({ id: 'unspecified' })} />
    : <Chip color="info" label={t({ id: regime, defaultMessage: regime })} />
}
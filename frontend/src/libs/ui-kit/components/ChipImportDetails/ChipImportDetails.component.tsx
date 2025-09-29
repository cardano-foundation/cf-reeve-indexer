import dayjs from 'dayjs'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface ChipImportDetailsProps {
  date: string
  user: string
}

export const ChipImportDetails = ({ date, user }: ChipImportDetailsProps) => {
  const { t } = useTranslations()

  return <Chip label={t({ id: 'importDetails' }, { date: dayjs(date).format('DD/MM/YYYY'), user })} />
}

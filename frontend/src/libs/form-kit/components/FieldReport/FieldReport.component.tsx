import { useField } from 'formik'

import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldReportProps {
  items: SelectOption[]
  isRequired?: boolean
}

export const FieldReport = ({ items, isRequired = false }: FieldReportProps) => {
  const [field] = useField<ReportType | string>('report')

  const { t } = useTranslations()

  const hasValue = field.value.length > 0
  const label = `${t({ id: 'reportType' })}${isRequired ? ' *' : ''}`

  return <InputSelect items={items} label={label} name={field.name} placeholder={!hasValue ? 'All' : ''} value={field.value} onChange={field.onChange} />
}

import { useField } from 'formik'

import { ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldReportProps {
  items: SelectOption[]
  isRequired?: boolean
}

export const FieldReport = ({ items, isRequired = false }: FieldReportProps) => {
  const [field] = useField<ReportType | string>('report')

  const { t } = useTranslations()

  const label = `${t({ id: 'reportType' })}${isRequired ? ' *' : ''}`

  return <InputSelect items={items} label={label} name={field.name} value={field.value} onChange={field.onChange} />
}

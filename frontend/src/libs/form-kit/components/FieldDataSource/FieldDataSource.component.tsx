import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldOrganizationProps {
  items: SelectOption[]
  isDisabled?: boolean
}

export const FieldDataSource = ({ items, isDisabled }: FieldOrganizationProps) => {
  const [field] = useField<string>('dataSource')

  const { t } = useTranslations()

  return <InputSelect name="dataSource" type="select" label={t({ id: 'dataSource' })} value={field.value} items={items} disabled={isDisabled} />
}

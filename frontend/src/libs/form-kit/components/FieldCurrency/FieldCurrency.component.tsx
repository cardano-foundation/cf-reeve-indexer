import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldCurrencyProps {
  items: SelectOption[]
  isRequired?: boolean
}

export const FieldCurrency = ({ items, isRequired = false }: FieldCurrencyProps) => {
  const [field] = useField<string>('currency')

  const { t } = useTranslations()

  const hasValue = field.value.length > 0
  const label = `${t({ id: 'currency' })}${isRequired ? ' *' : ''}`

  return <InputSelect items={items} label={label} name={field.name} value={field.value} onChange={field.onChange} />
}

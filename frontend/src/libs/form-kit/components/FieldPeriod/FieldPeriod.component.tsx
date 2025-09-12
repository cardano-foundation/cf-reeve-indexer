import Typography from '@mui/material/Typography'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldPeriodProps {
  items: SelectOption[]
  disabled?: boolean
  isRequired?: boolean
}

export const FieldPeriod = ({ items, disabled, isRequired = false }: FieldPeriodProps) => {
  const [field] = useField<string>('period')

  const { t } = useTranslations()

  const hasValue = field.value.length > 0
  const label = `${t({ id: 'period' })}${isRequired ? ' *' : ''}`

  return (
    <InputSelect
      items={items}
      label={label}
      name={field.name}
      placeholder={!hasValue ? 'All' : ''}
      value={field.value}
      onChange={field.onChange}
      renderMenuItem={({ name, sx }) => (
        <Typography component="span" variant="body1" sx={sx}>
          {name}
        </Typography>
      )}
      renderValue={(value) => (
        <Typography component="span" variant="body1">
          {items.find((item) => item.value === value)?.name}
        </Typography>
      )}
      disabled={disabled}
    />
  )
}

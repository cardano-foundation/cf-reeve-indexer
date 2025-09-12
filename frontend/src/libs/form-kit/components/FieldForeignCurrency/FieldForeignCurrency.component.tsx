import { useTheme } from '@mui/material'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldForeignCurrencyProps {
  items: SelectOption[]
  disabled?: boolean
  isAdornment?: boolean
}

export const FieldForeignCurrency = ({ items, disabled = false, isAdornment = false }: FieldForeignCurrencyProps) => {
  const [field] = useField<string>('originalCurrencyIdFCY')

  const { t } = useTranslations()

  const theme = useTheme()

  const hasValue = field.value.length > 0

  return (
    <InputSelect
      id={field.name}
      items={items}
      label={isAdornment ? '' : t({ id: 'originalCurrencyIdFCY' })}
      name={field.name}
      placeholder={!hasValue ? 'All' : ''}
      value={field.value}
      onBlur={field.onBlur}
      onChange={field.onChange}
      disabled={disabled}
      {...(isAdornment && {
        sx: {
          '&&.MuiInputBase-root': {
            background: 'transparent',
            boxShadow: 'none',
            width: 'auto',
            maxWidth: '70px'
          },
          '&& .MuiSelect-select': {
            paddingLeft: 0
          },
          '&& .MuiSelect-icon': {
            margin: theme.spacing(-0.5, 0.25, 0, 0),
            right: 0
          },
          '&& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          }
        }
      })}
    />
  )
}

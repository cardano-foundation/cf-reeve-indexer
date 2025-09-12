import { Field, FieldProps } from 'formik'

import { InputTextField } from 'libs/form-kit/components/InpuTextField/InputTextField.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

type FieldTextProps = {
  name: string
  label: string
  formatDisplayValue?: (value: string) => string
  disabled?: boolean
  required?: boolean
}

export const FieldText = ({ name, label, disabled = false, required = false, formatDisplayValue = (value: string) => value }: FieldTextProps) => {
  const { t } = useTranslations()

  return (
    <Field name={name}>
      {({ field, meta, form }: FieldProps) => (
        <InputTextField
          field={field}
          meta={meta}
          form={form}
          label={`${t({ id: label })}${required ? ' *' : ''}`}
          value={formatDisplayValue(field.value ?? '')}
          size="small"
          disabled={disabled}
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error ? meta.error : ''}
        />
      )}
    </Field>
  )
}

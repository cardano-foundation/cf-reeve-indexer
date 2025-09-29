import { FieldProps } from 'formik'

import { InputTextareaProps, InputTextarea } from 'libs/ui-kit/components/InputTextarea/InputTextarea.component.tsx'

type FieldTextProps = FieldProps &
  InputTextareaProps & {
    label?: string
    dataTestId?: string
    bottomText?: string
  }

export const InputTextareaField = ({ field, form, label, dataTestId, ...props }: FieldTextProps) => {
  return (
    <InputTextarea
      label={label}
      name={field.name}
      onChange={form.handleChange}
      onBlur={() => form.setFieldTouched(field.name)}
      value={field.value}
      dataTestId={dataTestId}
      {...props}
    />
  )
}

import { FieldProps } from 'formik'

import { InputText } from 'libs/ui-kit/components/InputText/InputText.component.tsx'
import { InputTextareaProps } from 'libs/ui-kit/components/InputTextarea/InputTextarea.component.tsx'

type InputTextFieldProps = FieldProps &
  InputTextareaProps & {
    label?: string
    dataTestId?: string
  }

export const InputTextField = ({ field, form, label, dataTestId, ...props }: InputTextFieldProps) => {
  return (
    <InputText
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

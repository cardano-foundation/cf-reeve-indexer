import { FieldProps } from 'formik'

import { InputPassword } from 'libs/ui-kit/components/InputPassword/InputPassword.component.tsx'

class InputOutlinedProps {}

type InputTextFieldProps = FieldProps &
  InputOutlinedProps & {
    label?: string
    dataTestId?: string
  }

export const InputPasswordField = ({ field, form, label, dataTestId, ...props }: InputTextFieldProps) => {
  return (
    <InputPassword
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

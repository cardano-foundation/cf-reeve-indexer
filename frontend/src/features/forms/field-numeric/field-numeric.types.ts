import type { InputNumericProps } from 'features/common'

export interface FieldNumericProps extends InputNumericProps {
  name: NonNullable<InputNumericProps['name']>
}

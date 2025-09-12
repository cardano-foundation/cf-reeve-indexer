import type { InputTextProps } from 'features/common'

export interface FieldTextProps extends InputTextProps {
  name: NonNullable<InputTextProps['name']>
}

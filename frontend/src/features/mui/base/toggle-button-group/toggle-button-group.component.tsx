import { ToggleButtonGroupStyled } from './toggle-button-group.styles'
import type { ToggleButtonGroupProps } from './toggle-button-group.types'

export const ToggleButtonGroup = ({ children, size = 'small', value, exclusive = true, ...props }: ToggleButtonGroupProps) => {
  return <ToggleButtonGroupStyled {...{ size, value, exclusive, ...props }}>{children}</ToggleButtonGroupStyled>
}

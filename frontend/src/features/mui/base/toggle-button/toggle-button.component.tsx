import { ToggleButtonStyled } from './toggle-button.styles'
import type { ToggleButtonProps } from './toggle-button.types'

export const ToggleButton = ({ children, size = 'small', value, onClick, disabled, selected, ...props }: ToggleButtonProps) => {
  return <ToggleButtonStyled {...{ size, value, onClick, disabled, selected, ...props }}>{children}</ToggleButtonStyled>
}

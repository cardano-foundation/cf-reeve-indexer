import type { ButtonProps } from 'features/mui/base'

export type ButtonPrimaryProps<C extends React.ElementType = 'button'> = Omit<ButtonProps<C>, 'color'>

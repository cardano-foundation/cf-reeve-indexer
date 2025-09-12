import type { ButtonProps } from 'features/mui/base'

export type ButtonSecondaryProps<C extends React.ElementType = 'button'> = Omit<ButtonProps<C>, 'color'>

import IconButton from '@mui/material/IconButton'
import type { IconButtonProps as IconButtonPropsMUI } from '@mui/material/IconButton'
import { ArrowLeft } from 'iconsax-react'
import type { MouseEventHandler } from 'react'
import { Link as RouterLink, LinkProps } from 'react-router-dom'

// Deliberately element-agnostic: this button renders as either a <button> or an <a> (see `to`), so it
// cannot re-export IconButtonProps wholesale — those event handlers are typed to HTMLButtonElement and
// would not fit the anchor form.
interface ButtonBackProps extends Pick<IconButtonPropsMUI, 'aria-label' | 'className' | 'color' | 'disabled' | 'edge' | 'id' | 'size' | 'sx'> {
  onClick?: MouseEventHandler<HTMLElement>
  replace?: LinkProps['replace']
  state?: LinkProps['state']
  to?: LinkProps['to']
}

/**
 * Back affordance. With `to` it renders as a router link, so the destination is a real anchor
 * (middle-click / open-in-new-tab / assistive tech all behave) and does not depend on browser history.
 * Without `to` it stays a plain icon button for callers that drive navigation via onClick.
 */
export const ButtonBack = ({ replace, state, to, ...props }: ButtonBackProps) => {
  if (to === undefined) {
    return (
      <IconButton {...props}>
        <ArrowLeft size={24} />
      </IconButton>
    )
  }

  return (
    <IconButton {...props} component={RouterLink} replace={replace} state={state} to={to}>
      <ArrowLeft size={24} />
    </IconButton>
  )
}

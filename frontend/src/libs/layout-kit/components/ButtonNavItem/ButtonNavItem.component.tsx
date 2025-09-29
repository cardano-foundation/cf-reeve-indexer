import { useTheme } from '@mui/material'
import { Icon } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { ListItemButtonStyled, ListItemIconStyled, ListItemStyled, ListItemTextStyled } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.styles'
import { IconToggle } from 'libs/ui-kit/components/IconToggle/IconToggle.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

interface ButtonNavItemProps {
  icon: Icon
  label: string
  route: string
  getCurrentPage: (route: string) => boolean
  onClick?: () => void
  hasMainRoute?: boolean
  hasIconHighlighted?: boolean
  hasTooltip: boolean
  isOpen?: boolean
}

export const ButtonNavItem = ({ icon: Icon, label, route, getCurrentPage, onClick, hasMainRoute = true, hasIconHighlighted, hasTooltip, isOpen }: ButtonNavItemProps) => {
  const theme = useTheme()

  const hasToggle = typeof onClick === 'function' && isOpen !== undefined
  const isCurrentPage = getCurrentPage(route)

  return (
    <ListItemStyled>
      <Tooltip
        key={hasTooltip ? label : ''}
        title={label}
        placement="right"
        arrow={false}
        disableFocusListener={!hasTooltip}
        disableHoverListener={!hasTooltip}
        disableInteractive={!hasTooltip}
        disableTouchListener={!hasTooltip}
      >
        <ListItemButtonStyled onClick={onClick} selected={isCurrentPage} {...(hasMainRoute ? { component: RouterLink, to: route } : {})}>
          <ListItemIconStyled>
            <Icon color={isCurrentPage ? theme.palette.primary.main : theme.palette.action.active} variant={hasIconHighlighted || isCurrentPage ? 'Bold' : 'Outline'} />
          </ListItemIconStyled>
          <ListItemTextStyled primary={label} primaryTypographyProps={{ fontWeight: isCurrentPage ? 600 : 400 }} $isCurrentPage={isCurrentPage} />
          {hasToggle && <IconToggle isCurrentPage={isCurrentPage} isOpen={isOpen} />}
        </ListItemButtonStyled>
      </Tooltip>
    </ListItemStyled>
  )
}

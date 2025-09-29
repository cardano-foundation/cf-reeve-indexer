import Collapse from '@mui/material/Collapse'
import { Icon } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { ListStyled, ListItemStyled, ListItemButtonStyled, ListItemTextStyled } from 'libs/layout-kit/components/CollapseNavItem/CollapseNavItem.styles.tsx'

interface SubRoute {
  label: string
  route: string
}

interface NavCollapseProps {
  icon: Icon
  label: string
  route: string
  subRoutes: SubRoute[]
  getCurrentPage: (route: string) => boolean
  onToggleMenu: () => void
  hasMainRoute?: boolean
  hasTooltip: boolean
  isOpen?: boolean
}

export const CollapseNavItem = ({ icon: Icon, label, route, subRoutes, getCurrentPage, onToggleMenu, hasMainRoute, hasTooltip, isOpen }: NavCollapseProps) => {
  const isIconHighlighted = getCurrentPage(route) || subRoutes.some(({ route }) => getCurrentPage(route))

  return (
    <>
      <ButtonNavItem
        icon={Icon}
        label={label}
        route={route}
        getCurrentPage={getCurrentPage}
        onClick={onToggleMenu}
        hasMainRoute={hasMainRoute}
        hasIconHighlighted={isIconHighlighted}
        isOpen={isOpen}
        hasTooltip={hasTooltip}
      />
      <Collapse component={ListItemStyled} in={isOpen} timeout="auto" unmountOnExit>
        <ListStyled>
          {subRoutes.map(({ label, route }) => {
            const isSelected = getCurrentPage(route)

            return (
              <ListItemStyled key={route}>
                <ListItemButtonStyled component={RouterLink} to={route} selected={isSelected}>
                  <ListItemTextStyled primary={label} primaryTypographyProps={{ fontWeight: isSelected ? 600 : 400 }} $isCurrentPage={isSelected} />
                </ListItemButtonStyled>
              </ListItemStyled>
            )
          })}
        </ListStyled>
      </Collapse>
    </>
  )
}

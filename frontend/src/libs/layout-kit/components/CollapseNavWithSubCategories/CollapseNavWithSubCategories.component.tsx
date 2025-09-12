import Collapse from '@mui/material/Collapse'
import { Icon } from 'iconsax-react'
import { groupBy } from 'lodash'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { ButtonNavSubItem } from 'libs/layout-kit/components/ButtonNavSubItem/ButtonNavSubItem.component.tsx'
import {
  ListStyled,
  ListItemStyled,
  ListItemButtonStyled,
  ListItemTextStyled
} from 'libs/layout-kit/components/CollapseNavWithSubCategories/CollapseNavWithSubCategories.styles.tsx'
import { MenuSubCategory } from 'libs/layout-kit/layout-auth/components/LayoutAuthContext/LayoutAuthContext.component.tsx'

interface SubRoute {
  label: string
  route: string
  group: string
}

interface SubSection {
  id: MenuSubCategory
  route: string
}

interface CollapseNavWithSubCategoriesProps {
  activeSubSection: MenuSubCategory | null
  icon: Icon
  label: string
  route: string
  subRoutes: SubRoute[]
  subSections: SubSection[]
  getCurrentPage: (route: string) => boolean
  onToggleMenu: () => void
  onToggleSubMenu: (subSection: MenuSubCategory) => void
  hasMainRoute?: boolean
  hasTooltip: boolean
  isOpen?: boolean
}

export const CollapseNavWithSubCategories = ({
  activeSubSection,
  icon: Icon,
  label,
  route,
  subRoutes,
  subSections,
  getCurrentPage,
  onToggleMenu,
  onToggleSubMenu,
  hasMainRoute,
  hasTooltip,
  isOpen
}: CollapseNavWithSubCategoriesProps) => {
  const isIconHighlighted = getCurrentPage(route) || subRoutes.some(({ route }) => getCurrentPage(route))

  const groupedSubRoutes = groupBy(subRoutes, ({ group }) => group)

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
          {Object.entries(groupedSubRoutes).map(([group, subRoutes], index) => {
            return (
              <Fragment key={group}>
                <ButtonNavSubItem
                  getCurrentPage={getCurrentPage}
                  route={subSections[index].route}
                  label={group}
                  onClick={() => onToggleSubMenu(subSections[index].id)}
                  isOpen={activeSubSection === subSections[index].id}
                />
                <Collapse component={ListItemStyled} in={activeSubSection === subSections[index].id} timeout="auto" unmountOnExit>
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
              </Fragment>
            )
          })}
        </ListStyled>
      </Collapse>
    </>
  )
}

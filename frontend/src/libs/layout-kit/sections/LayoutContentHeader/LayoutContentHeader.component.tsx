import { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { ReactNode } from 'react'
import { useMediaQueries } from 'hooks'

import { Details } from 'libs/layout-kit/components/Details/Details.component.tsx'
import { LayoutContentHeaderStyled } from 'libs/layout-kit/sections/LayoutContentHeader/LayoutContentHeader.styles.tsx'
import { ButtonBack } from 'libs/ui-kit/components/ButtonBack/ButtonBack.component.tsx'
import { OrganisationFormSidebar } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.component'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { Grid } from '@mui/material'
import { PATHS } from 'routes'
import { useLocationState } from 'hooks'

interface LayoutContentHeaderProps extends BoxPropsMUI {
  children: ReactNode
}

export const LayoutContentHeader = ({ children }: LayoutContentHeaderProps) => {
  const { isSidebarOpen, selectedOrganisation } = useLayoutPublicContext()

  const initialValues = {
    organisations: selectedOrganisation
  }

  const { pathname } = useLocationState()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)
  const isResources = isActiveRouteOrDescendant(PATHS.PUBLIC_RESOURCES)
  const { isMobile } = useMediaQueries()

  return (
    <LayoutContentHeaderStyled component="header">
      <Grid container direction={{ xs: 'column', sm: 'row' }} height="100%" wrap="nowrap" sx={{ flexGrow: 1 }}>
        <Grid flexShrink={0}>{children}</Grid>
        {!isResources && isMobile && (
          <Grid size="grow">
            <OrganisationFormSidebar initialValues={initialValues} onSubmit={() => undefined} isSidebarOpen={isSidebarOpen} />
          </Grid>
        )}
      </Grid>
    </LayoutContentHeaderStyled>
  )
}

LayoutContentHeader.ButtonBack = ButtonBack
LayoutContentHeader.Details = Details

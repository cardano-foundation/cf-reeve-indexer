import { createContext, useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { DrawerType } from 'consts'
import { useLocationState, useMediaQueries } from 'hooks'
import { useLayoutDrawer } from 'libs/layout-kit/hooks/useLayoutDrawer'
import { useLayoutSidebar } from 'libs/layout-kit/hooks/useLayoutSidebar'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'
import { PATHS } from 'routes'

interface LayoutPublicContextProps {
  selectedOrganisation: string
  toggledSection: MenuCategory | null
  type: DrawerType | null
  handleDrawerClose: () => void
  handleDrawerOpen: (event: MouseEvent<HTMLElement>, newValue: DrawerType) => void
  handleSectionMenuToggle: (category?: MenuCategory) => void
  handleSidebarToggle: () => void
  setSelectedOrganisation: (org: string) => void
  organisations: any[]
  setOrganisations: (orgs: any[]) => void
  isDrawerOpen: boolean
  isResourcesOpen: boolean
  isProjectsOpen: boolean
  isSidebarOpen: boolean
}

export enum MenuCategory {
  RESOURCES = 'RESOURCES',
  PROJECTS = 'PROJECTS'
}

export const LayoutPublicContext = createContext<LayoutPublicContextProps | undefined>(undefined)

export const LayoutPublicContextProvider = ({ children }: { children: ReactNode }) => {
  const [toggledSection, setToggledSection] = useState<MenuCategory | null>(null)
  const [selectedOrganisation, setSelectedOrganisationState] = useState<string>('')
  const [organisations, setOrganisations] = useState<any[]>([])

  const timeoutId = useRef<number | null>(null)

  const { isDesktop, isMobile } = useMediaQueries()

  const { pathname } = useLocationState()

  const navigate = useNavigate()
  const { organisations: availableOrganisations } = useGetOrganisationsModel()

  const { handleCloseSidebar, handleOpenSidebar, handleToggleSidebar, isSidebarOpen } = useLayoutSidebar()

  const { type, handleCloseDrawer, handleOpenDrawer, isDrawerOpen } = useLayoutDrawer()

  const isResourcesOpen = toggledSection === MenuCategory.RESOURCES
  const isProjectsOpen = toggledSection === MenuCategory.PROJECTS

  // Toggle section menu
  const handleSectionMenuToggle = useCallback(
    (section?: MenuCategory) => {
      setToggledSection((prevSection) => (section && prevSection !== section ? section : null))

      if (!isSidebarOpen) handleToggleSidebar()
    },
    [handleToggleSidebar, isSidebarOpen]
  )

  const handleSidebarToggle = useCallback(() => {
    setToggledSection(null)
    handleToggleSidebar()
  }, [handleToggleSidebar])

  const handleDrawerClose = useCallback(() => {
    if (isDesktop && !isMobile && !isSidebarOpen) {
      handleOpenSidebar()
    }

    handleCloseDrawer()
  }, [handleCloseDrawer, handleOpenSidebar, isDesktop, isMobile, isSidebarOpen])

  const handleDrawerOpen = useCallback(
    (event: MouseEvent<HTMLElement>, newValue: DrawerType) => {
      timeoutId.current && window.clearTimeout(timeoutId.current)

      const value = ((event.target as HTMLButtonElement)?.value as DrawerType) ?? newValue

      if (isDesktop && !isMobile && isSidebarOpen) {
        handleCloseSidebar()

        setToggledSection(null)
      }

      if (type !== null && type !== value) {
        handleCloseDrawer()

        timeoutId.current = window.setTimeout(() => {
          handleOpenDrawer(value)
        }, 350)

        return
      }

      handleOpenDrawer(value)
    },
    [type, handleCloseDrawer, handleOpenDrawer, handleCloseSidebar, isDesktop, isMobile, isSidebarOpen]
  )

  useEffect(() => {
    if (isSidebarOpen && !toggledSection) {
      const categories = {
        [PATHS.PUBLIC_RESOURCES]: MenuCategory.RESOURCES,
        [PATHS.PUBLIC_PROJECTS]: MenuCategory.PROJECTS
      } as const

      const section = Object.keys(categories).find((path) => pathname.includes(path))
      if (section) setToggledSection(categories[section])
    }
  }, [pathname, isSidebarOpen, toggledSection])

  useEffect(() => {
    if (!availableOrganisations?.length) return

    setOrganisations(availableOrganisations)
  }, [availableOrganisations])

  useEffect(() => {
    setToggledSection(null)
  }, [selectedOrganisation])

  useEffect(() => {
    return () => {
      timeoutId.current && window.clearTimeout(timeoutId.current)
    }
  }, [])

  const setSelectedOrganisation = useCallback((org: any) => {
    // normalize incoming value to a string id
    const resolve = (o: any) => (o == null ? '' : typeof o === 'string' ? o : (o?.value ?? o?.id ?? ''))
    setSelectedOrganisationState(resolve(org))
  }, [])

  return (
    <LayoutPublicContext.Provider
      value={{
        selectedOrganisation,
        toggledSection,
        type,
        handleDrawerClose,
        handleDrawerOpen,
        handleSidebarToggle,
        handleSectionMenuToggle,
        setSelectedOrganisation,
        organisations,
        setOrganisations,
        isDrawerOpen,
        isResourcesOpen,
        isProjectsOpen,
        isSidebarOpen
      }}>
      {children}
    </LayoutPublicContext.Provider>
  )
}

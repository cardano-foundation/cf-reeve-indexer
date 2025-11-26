import { createContext, useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { DrawerType } from 'consts'
import { useLocationState, useMediaQueries } from 'hooks'
import { useLayoutDrawer } from 'libs/layout-kit/hooks/useLayoutDrawer'
import { useLayoutSidebar } from 'libs/layout-kit/hooks/useLayoutSidebar'
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
  isDrawerOpen: boolean
  isResourcesOpen: boolean
  isSidebarOpen: boolean
}

export enum MenuCategory {
  RESOURCES = 'RESOURCES'
}

export const LayoutPublicContext = createContext<LayoutPublicContextProps | undefined>(undefined)

export const LayoutPublicContextProvider = ({ children }: { children: ReactNode }) => {
  const [toggledSection, setToggledSection] = useState<MenuCategory | null>(null)
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('')

  const timeoutId = useRef<number | null>(null)

  const { isDesktop, isMobile } = useMediaQueries()

  const { pathname } = useLocationState()

  const navigate = useNavigate()

  const { handleCloseSidebar, handleOpenSidebar, handleToggleSidebar, isSidebarOpen } = useLayoutSidebar()

  const { type, handleCloseDrawer, handleOpenDrawer, isDrawerOpen } = useLayoutDrawer()

  const isResourcesOpen = toggledSection === MenuCategory.RESOURCES

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
        [PATHS.PUBLIC_RESOURCES]: MenuCategory.RESOURCES
      } as const

      const section = Object.keys(categories).find((path) => pathname.includes(path))
      if (section) setToggledSection(categories[section])
    }
  }, [pathname, isSidebarOpen, toggledSection])

  useEffect(() => {
    if (selectedOrganisation === '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca95') {
      setToggledSection(null)
      handleToggleSidebar()
      navigate(PATHS.PUBLIC_REWARD_DASHBOARD)
    } else if (selectedOrganisation === '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94') {
      setToggledSection(null)
      navigate(PATHS.PUBLIC_DASHBOARD)
    }
  }, [selectedOrganisation, navigate])

  useEffect(() => {
    return () => {
      timeoutId.current && window.clearTimeout(timeoutId.current)
    }
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
        isDrawerOpen,
        isResourcesOpen,
        isSidebarOpen
      }}
    >
      {children}
    </LayoutPublicContext.Provider>
  )
}

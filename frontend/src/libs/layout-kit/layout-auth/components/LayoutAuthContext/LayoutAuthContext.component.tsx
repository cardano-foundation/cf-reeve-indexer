import { createContext, useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'

import { type DrawerType } from 'consts'
import { useLocationState, useMediaQueries } from 'hooks'
import { useLayoutDrawer } from 'libs/layout-kit/hooks/useLayoutDrawer.ts'
import { useLayoutSidebar } from 'libs/layout-kit/hooks/useLayoutSidebar.ts'
import { PATHS } from 'routes'

export enum MenuCategory {
  TRANSACTIONS = 'TRANSACTIONS',
  DATA_EXPLORER = 'DATA_EXPLORER',
  REPORTING = 'REPORTING',
  SETTINGS = 'SETTINGS'
}

export enum MenuSubCategory {
  ACCOUNT = 'ACCOUNT',
  ORGANIZATION = 'ORGANIZATION'
}

interface LayoutAuthContextProps {
  type: DrawerType | null
  toggledSection: MenuCategory | null
  toggledSubSection: MenuSubCategory | null
  handleDrawerClose: () => void
  handleDrawerOpen: (event: MouseEvent<HTMLElement>, newValue: DrawerType) => void
  handleSectionMenuToggle: (category?: MenuCategory) => void
  handleSectionSubMenuToggle: (subCategory: MenuSubCategory) => void
  handleSidebarToggle: () => void
  isDrawerOpen: boolean
  isFiltersDrawerOpen: boolean
  isInsightsDrawerOpen: boolean
  isTransactionsOpen: boolean
  isDataExplorerOpen: boolean
  isReportingOpen: boolean
  isSettingsOpen: boolean
  isSidebarOpen: boolean
}

export const LayoutAuthContext = createContext<LayoutAuthContextProps | undefined>(undefined)

export const LayoutAuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [toggledSection, setToggledSection] = useState<MenuCategory | null>(null)
  const [toggledSubSection, setToggledSubSection] = useState<MenuSubCategory | null>(null)

  const timeoutId = useRef<number | null>(null)

  const { isDesktop, isMobile } = useMediaQueries()

  const { pathname } = useLocationState()

  const { handleCloseSidebar, handleOpenSidebar, handleToggleSidebar, isSidebarOpen } = useLayoutSidebar()

  const { type, handleCloseDrawer, handleOpenDrawer, isDrawerOpen, isFiltersDrawerOpen, isInsightsDrawerOpen } = useLayoutDrawer()

  const isTransactionsOpen = toggledSection === MenuCategory.TRANSACTIONS
  const isDataExplorerOpen = toggledSection === MenuCategory.DATA_EXPLORER
  const isReportingOpen = toggledSection === MenuCategory.REPORTING
  const isSettingsOpen = toggledSection === MenuCategory.SETTINGS

  const handleSectionMenuToggle = useCallback(
    (section?: MenuCategory) => {
      setToggledSection((prevSection) => (section && prevSection !== section ? section : null))

      if (!isSidebarOpen) {
        handleToggleSidebar()
      }
    },
    [handleToggleSidebar, isSidebarOpen]
  )

  const handleSectionSubMenuToggle = useCallback(
    (subSection: MenuSubCategory) => {
      setToggledSubSection((prevSubSection) => (subSection && prevSubSection !== subSection ? subSection : null))

      if (!isSidebarOpen) {
        handleToggleSidebar()
      }
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
        setToggledSubSection(null)
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
        [PATHS.TRANSACTIONS]: MenuCategory.TRANSACTIONS,
        [PATHS.DATA_EXPLORER]: MenuCategory.DATA_EXPLORER,
        [PATHS.REPORTING]: MenuCategory.REPORTING,
        [PATHS.SETTINGS]: MenuCategory.SETTINGS
      } as const

      const section = Object.keys(categories).find((path) => pathname.includes(path))

      if (section) {
        setToggledSection(categories[section])
      }
    }
  }, [pathname, isSidebarOpen])

  useEffect(() => {
    if (isSidebarOpen && !toggledSubSection) {
      const subCategories = {
        [PATHS.SETTINGS_ACCOUNTS]: MenuSubCategory.ORGANIZATION,
        [PATHS.SETTINGS_ORGANIZATION]: MenuSubCategory.ORGANIZATION,
        [PATHS.SETTINGS_EVENT_CODES]: MenuSubCategory.ORGANIZATION
      } as const

      const subSection = Object.keys(subCategories).find((path) => pathname.includes(path))

      if (subSection) {
        setToggledSubSection(subCategories[subSection])
      }
    }
  }, [pathname, isSidebarOpen])

  useEffect(() => {
    return () => {
      timeoutId.current && window.clearTimeout(timeoutId.current)
    }
  }, [])

  return (
    <LayoutAuthContext.Provider
      value={{
        type,
        toggledSection,
        toggledSubSection,
        handleDrawerClose,
        handleDrawerOpen,
        handleSectionMenuToggle,
        handleSectionSubMenuToggle,
        handleSidebarToggle,
        isDrawerOpen,
        isFiltersDrawerOpen,
        isInsightsDrawerOpen,
        isTransactionsOpen,
        isDataExplorerOpen,
        isReportingOpen,
        isSettingsOpen,
        isSidebarOpen
      }}
    >
      {children}
    </LayoutAuthContext.Provider>
  )
}

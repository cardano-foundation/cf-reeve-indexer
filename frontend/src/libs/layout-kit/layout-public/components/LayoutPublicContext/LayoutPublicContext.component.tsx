import { ReactNode, createContext, useCallback, useEffect, useState } from 'react'

import { useLocationState } from 'hooks'
import { useLayoutSidebar } from 'libs/layout-kit/hooks/useLayoutSidebar.ts'
import { PATHS } from 'routes'

interface LayoutPublicContextProps {
  handleSidebarToggle: () => void
  isSidebarOpen: boolean
  toggledSection: MenuCategory | null
  handleSectionMenuToggle: (category?: MenuCategory) => void
  isResourcesOpen: boolean
}

export enum MenuCategory {
  RESOURCES = 'RESOURCES'
}

export const LayoutPublicContext = createContext<LayoutPublicContextProps | undefined>(undefined)

export const LayoutPublicContextProvider = ({ children }: { children: ReactNode }) => {
  const [toggledSection, setToggledSection] = useState<MenuCategory | null>(null)

  const { pathname } = useLocationState()

  const { handleToggleSidebar, isSidebarOpen } = useLayoutSidebar()

  const isResourcesOpen = toggledSection === MenuCategory.RESOURCES

  const handleSectionMenuToggle = useCallback(
    (section?: MenuCategory) => {
      setToggledSection((prevSection) => (section && prevSection !== section ? section : null))

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

  useEffect(() => {
    if (isSidebarOpen && !toggledSection) {
      const categories = {
        [PATHS.PUBLIC_RESOURCES]: MenuCategory.RESOURCES
      } as const

      const section = Object.keys(categories).find((path) => pathname.includes(path))

      if (section) {
        setToggledSection(categories[section])
      }
    }
  }, [pathname, isSidebarOpen])

  return (
    <LayoutPublicContext.Provider value={{ handleSidebarToggle, handleSectionMenuToggle, isSidebarOpen, toggledSection, isResourcesOpen }}>{children}</LayoutPublicContext.Provider>
  )
}

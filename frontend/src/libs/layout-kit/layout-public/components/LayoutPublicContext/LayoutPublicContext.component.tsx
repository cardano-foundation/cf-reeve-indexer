import { ReactNode, createContext, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationState } from 'hooks'
import { useLayoutSidebar } from 'libs/layout-kit/hooks/useLayoutSidebar.ts'
import { PATHS } from 'routes'

interface LayoutPublicContextProps {
  handleSidebarToggle: () => void
  isSidebarOpen: boolean
  toggledSection: MenuCategory | null
  handleSectionMenuToggle: (category?: MenuCategory) => void
  isResourcesOpen: boolean
  selectedOrganisation: string
  setSelectedOrganisation: (org: string) => void
}

export enum MenuCategory {
  RESOURCES = 'RESOURCES'
}

export const LayoutPublicContext = createContext<LayoutPublicContextProps | undefined>(undefined)

export const LayoutPublicContextProvider = ({ children }: { children: ReactNode }) => {
  const [toggledSection, setToggledSection] = useState<MenuCategory | null>(null)
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('')

  const { pathname } = useLocationState()
  const { handleToggleSidebar, isSidebarOpen } = useLayoutSidebar()
  const navigate = useNavigate()

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

  return (
    <LayoutPublicContext.Provider
      value={{
        handleSidebarToggle,
        handleSectionMenuToggle,
        isSidebarOpen,
        toggledSection,
        isResourcesOpen,
        selectedOrganisation,
        setSelectedOrganisation
      }}>
      {children}
    </LayoutPublicContext.Provider>
  )
}

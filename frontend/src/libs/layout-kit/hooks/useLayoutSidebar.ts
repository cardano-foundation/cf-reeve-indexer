import { useState } from 'react'

export const useLayoutSidebar = (isInitiallyOpen = true) => {
  const [isSidebarOpen, setSidebarOpen] = useState(isInitiallyOpen)

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const handleOpenSidebar = () => {
    setSidebarOpen(true)
  }

  const handleToggleSidebar = () => {
    setSidebarOpen((isOpen) => !isOpen)
  }

  return { handleCloseSidebar, handleOpenSidebar, handleToggleSidebar, isSidebarOpen }
}

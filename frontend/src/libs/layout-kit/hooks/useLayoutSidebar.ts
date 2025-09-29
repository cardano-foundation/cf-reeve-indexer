import { useState } from 'react'

export const useLayoutSidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true)

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

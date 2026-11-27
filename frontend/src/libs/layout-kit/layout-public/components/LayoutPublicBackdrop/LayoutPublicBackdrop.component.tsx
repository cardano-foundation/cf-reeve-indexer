import Backdrop from '@mui/material/Backdrop'
import { useState } from 'react'

import { useMediaQueries } from 'hooks'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'

export const LayoutPublicBackdrop = () => {
  const { handleDrawerClose, handleSidebarToggle, isDrawerOpen, isSidebarOpen } = useLayoutPublicContext()
  const { isMobile, isTablet } = useMediaQueries()

  const [isAboveSidebar, setIsAboveSidebar] = useState(false)

  if (isSidebarOpen) {
    if (isAboveSidebar) setIsAboveSidebar(false)
  } else if (isDrawerOpen && !isAboveSidebar) {
    setIsAboveSidebar(true)
  }

  const handleClose = () => {
    if (isDrawerOpen) handleDrawerClose()
    if (isSidebarOpen) handleSidebarToggle()
  }

  return (
    <Backdrop
      open={isTablet && !isMobile && (isSidebarOpen || isDrawerOpen)}
      sx={(theme) => ({ zIndex: isAboveSidebar ? theme.zIndex.drawer + 1 : theme.zIndex.drawer - 1, background: `${theme.palette.common.black}40` })}
      onClick={handleClose}
    />
  )
}

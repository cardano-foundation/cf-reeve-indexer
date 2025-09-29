import { useTheme } from '@mui/material'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'

import { IconButtonStyled, IconWrapperStyled } from 'libs/layout-kit/components/ButtonToggleSidebar/ButtonToggleSidebar.styles.tsx'

interface ButtonToggleSidebarProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export const ButtonToggleSidebar = ({ onToggleSidebar, isSidebarOpen }: ButtonToggleSidebarProps) => {
  const theme = useTheme()

  const Icon = isSidebarOpen ? ArrowLeft2 : ArrowRight2

  return (
    <IconButtonStyled aria-label="Sidebar toggle" onClick={onToggleSidebar} $isSidebarOpen={isSidebarOpen}>
      <IconWrapperStyled component="span">
        <Icon color={theme.palette.action.active} size={14} variant="Outline" />
      </IconWrapperStyled>
    </IconButtonStyled>
  )
}

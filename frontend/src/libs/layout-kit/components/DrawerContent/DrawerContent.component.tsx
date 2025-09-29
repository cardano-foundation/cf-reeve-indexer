import Box from '@mui/material/Box'
import { ReactNode } from 'react'

import { useMediaQueries } from 'hooks'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'

interface DrawerContentProps {
  children: ReactNode
}

export const DrawerContent = ({ children }: DrawerContentProps) => {
  const { isMobile } = useMediaQueries()

  if (isMobile) {
    return <DialogContent>{children}</DialogContent>
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" padding={3} overflow="hidden auto">
      {children}
    </Box>
  )
}

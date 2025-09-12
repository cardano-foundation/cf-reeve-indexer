import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { ReactNode } from 'react'

import { useMediaQueries } from 'hooks'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'

interface DrawerFooterProps {
  children?: ReactNode
}

export const DrawerFooter = ({ children }: DrawerFooterProps) => {
  const theme = useTheme()

  const { isMobile } = useMediaQueries()

  if (isMobile) {
    return <DialogActions>{children}</DialogActions>
  }

  return (
    <Box alignItems="center" borderTop={`1px solid ${theme.palette.divider}`} component="footer" display="flex" flex="1 0 100%" height="100%" maxHeight="5.625rem" padding={3}>
      {children}
    </Box>
  )
}

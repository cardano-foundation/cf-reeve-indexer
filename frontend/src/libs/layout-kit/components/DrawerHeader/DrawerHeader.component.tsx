import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import { useMediaQueries } from 'hooks'
import { ButtonClose } from 'libs/ui-kit/components/ButtonClose/ButtonClose.component.tsx'

interface DrawerHeaderProps {
  title: string
  onClose: () => void
}

export const DrawerHeader = ({ title, onClose }: DrawerHeaderProps) => {
  const theme = useTheme()

  const { isMobile } = useMediaQueries()

  if (isMobile) {
    return (
      <Box alignItems="center" display="flex" justifyContent="space-between" pt={2} pr={2} pb={1} pl={3}>
        <DialogTitle id="dialog-alert-title" sx={{ p: 0 }}>
          {title}
        </DialogTitle>
        <ButtonClose onClick={onClose} />
      </Box>
    )
  }

  return (
    <Box
      alignItems="center"
      borderBottom={`1px solid ${theme.palette.divider}`}
      component="header"
      display="flex"
      flex="1 0 100%"
      gap={1}
      height="100%"
      maxHeight="7rem"
      padding={3}
    >
      <Box alignItems="center" display="flex" flex="1 0 auto">
        <Typography variant="h2">{title}</Typography>
      </Box>
      <ButtonClose onClick={onClose} />
    </Box>
  )
}

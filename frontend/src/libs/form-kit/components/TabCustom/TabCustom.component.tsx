import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import { ReactNode } from 'react'

import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

export const a11yProps = (tabName: string) => {
  return {
    id: `tab-${tabName}`,
    'aria-controls': `tabpanel-${tabName}`
  }
}

interface TabCustomProps {
  icon?: ReactNode
  label: string
  pillContent?: string | number
  isDisabled: boolean
}

export const TabCustom = ({ icon = null, label, pillContent, isDisabled, ...other }: TabCustomProps) => {
  const theme = useTheme()

  return (
    <Tab
      icon={
        <Box display="flex" alignItems="center">
          {icon}
          <Box ml={1} sx={{ textTransform: 'none' }}>
            {label}
          </Box>
          <Chip
            label={pillContent}
            variant="filled"
            sx={{
              ml: 1,
              backgroundColor: theme.palette.grey[200],
              color: !isDisabled ? 'primary.main' : isDisabled ? 'text.secondary' : 'primary.contrastText'
            }}
          />
        </Box>
      }
      {...other}
    />
  )
}

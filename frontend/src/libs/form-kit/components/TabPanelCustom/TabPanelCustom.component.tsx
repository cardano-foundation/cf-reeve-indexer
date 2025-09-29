import Box from '@mui/material/Box'
import { ReactNode } from 'react'

interface TabPanelCustomProps {
  children?: ReactNode
  index: number
  value: number
}

export const TabPanelCustom = ({ children, value, index }: TabPanelCustomProps) => {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} height="100%" width="100%">
      {value === index && (
        <Box display="flex" height="100%" width="100%">
          {children}
        </Box>
      )}
    </Box>
  )
}

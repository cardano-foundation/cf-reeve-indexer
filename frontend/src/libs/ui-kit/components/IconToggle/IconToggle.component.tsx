import Box from '@mui/material/Box'

import { ArrowDownIcon, ArrowUpIcon } from 'libs/ui-kit/components/IconToggle/IconToggle.styles.tsx'

interface IconToggleProps {
  isCurrentPage: boolean
  isOpen: boolean
}

export const IconToggle = ({ isCurrentPage, isOpen }: IconToggleProps) => {
  return (
    <Box alignItems="center" display="flex" height="1.875rem" justifyContent="center" width="1.875rem" p={0}>
      {isOpen ? <ArrowUpIcon $isCurrentPage={isCurrentPage} /> : <ArrowDownIcon $isCurrentPage={isCurrentPage} />}
    </Box>
  )
}

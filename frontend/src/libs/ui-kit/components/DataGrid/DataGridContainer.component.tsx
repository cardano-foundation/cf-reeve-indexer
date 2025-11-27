import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { ReactNode } from 'react'

import { DataGrid } from 'libs/ui-kit/components/DataGrid/DataGrid.component.tsx'
import { DataGridContainerStyled, DataGridHeaderStyled } from 'libs/ui-kit/components/DataGrid/DataGridContainer.styles.tsx'

interface DataGridContainerProps {
  children: ReactNode
}

const DataGridContainer = ({ children }: DataGridContainerProps) => (
  <DataGridContainerStyled component={Paper} display="flex" flexDirection="column" maxHeight={{ xs: '37.5rem', sm: '100%' }} width="100%" overflow="hidden">
    {children}
  </DataGridContainerStyled>
)

DataGridContainer.displayName = 'DataGridContainer'

interface HeaderProps {
  children: ReactNode
}

const Header = ({ children }: HeaderProps) => <DataGridHeaderStyled>{children}</DataGridHeaderStyled>

Header.displayName = 'DataGridContainer.Header'

interface ToolbarProps {
  children: ReactNode
}

const Toolbar = ({ children }: ToolbarProps) => {
  const theme = useTheme()

  return (
    <Box borderBottom={`1px solid ${theme.palette.divider}`} display="flex" gap={4} p={2}>
      {children}
    </Box>
  )
}

DataGridContainer.Header = Header
DataGridContainer.Table = DataGrid
DataGridContainer.Toolbar = Toolbar

export { DataGridContainer }

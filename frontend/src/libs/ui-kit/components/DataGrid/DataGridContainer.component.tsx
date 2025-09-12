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

DataGridContainer.Header = Header
DataGridContainer.Table = DataGrid

export { DataGridContainer }

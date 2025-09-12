import TableCellMUI, { TableCellProps as TableCellMUIProps } from '@mui/material/TableCell'
import { ReactNode } from 'react'

interface TableCellProps extends TableCellMUIProps {
  children: ReactNode
}

export const TableCell = ({ children, ...props }: TableCellProps) => <TableCellMUI {...props}>{children}</TableCellMUI>

import { TableCellProps as TableCellMUIProps } from '@mui/material/TableCell'

import { TableCellStickyActionsStyled } from 'libs/ui-kit/components/TableCellStickyActions/TableCellStickyActions.styles.tsx'

interface TableCellStickyActionsProps extends TableCellMUIProps {
  $background?: string
}

export const TableCellStickyActions = ({ children, ...props }: TableCellStickyActionsProps) => <TableCellStickyActionsStyled {...props}>{children}</TableCellStickyActionsStyled>

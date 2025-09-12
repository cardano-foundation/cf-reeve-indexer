import { useTheme } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { GetCostCentersResponse200 } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { TableCellStickyActions } from 'libs/ui-kit/components/TableCellStickyActions/TableCellStickyActions.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

interface TableCostCentersRowItemsProps {
  data: GetCostCentersResponse200
  onCostCenterEdit: (id: string) => void
}

export const TableCostCentersItems = ({ data, onCostCenterEdit }: TableCostCentersRowItemsProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Table aria-label="cost-centers-items-table" sx={{ width: '100%', tableLayout: 'fixed' }}>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.customerCode} sx={{ '& > .MuiTableCell-root': { height: '3.25rem', borderBottom: 'unset' } }}>
            <TableCell align="right" sx={{ padding: theme.spacing(0.5, 2), width: '72px' }} />
            <TableCell align="left" sx={{ padding: theme.spacing(0.5, 2, 0.5, 4), width: '15%' }}>
              {item.customerCode}
            </TableCell>
            <TableCell align="left" sx={{ padding: theme.spacing(0.5, 2), width: '65%' }}>
              {item.name}
            </TableCell>
            <TableCell align="left" sx={{ padding: theme.spacing(0.5, 2), width: '12.5%' }}>
              {item.active ? <TickCircle color={paletteColors.green[600]} size={20} variant="Bold" /> : <CloseCircle color={paletteColors.red[600]} size={20} variant="Bold" />}
            </TableCell>
            <TableCellStickyActions sx={{ padding: theme.spacing(0.5, 2), width: '68px' }} $background={theme.palette.common.white}>
              <Tooltip title={t({ id: 'edit' })}>
                <ButtonIcon size="medium" onClick={() => onCostCenterEdit(item.customerCode)}>
                  <Edit size={20} variant="Outline" />
                </ButtonIcon>
              </Tooltip>
            </TableCellStickyActions>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

import { useTheme } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { GetRefCodesResponse200 } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { TableCellStickyActions } from 'libs/ui-kit/components/TableCellStickyActions/TableCellStickyActions.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

interface TableRefCodesItemsProps {
  data: GetRefCodesResponse200
  onRefCodeEdit: (id: string) => void
}

export const TableRefCodesItems = ({ data, onRefCodeEdit }: TableRefCodesItemsProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Table aria-label="reference-codes-items-table" sx={{ width: '100%', tableLayout: 'fixed' }}>
      <TableBody>
        {data.map(({ active, description, referenceCode }) => (
          <TableRow key={referenceCode} sx={{ '& > .MuiTableCell-root': { height: '3.25rem', borderBottom: 'unset' } }}>
            <TableCell align="right" sx={{ padding: theme.spacing(0.5, 2), width: '72px' }} />
            <TableCell align="left" sx={{ padding: theme.spacing(0.5, 2, 0.5, 4), width: '15%' }}>
              {referenceCode}
            </TableCell>
            <TableCell align="left" sx={{ padding: theme.spacing(0.5, 2), width: '72.5%' }}>
              {description}
            </TableCell>
            <TableCell align="left" sx={{ padding: theme.spacing(0.5, 2), width: '12.5%' }}>
              {active ? <TickCircle color={paletteColors.green[600]} size={20} variant="Bold" /> : <CloseCircle color={paletteColors.red[600]} size={20} variant="Bold" />}
            </TableCell>
            <TableCellStickyActions sx={{ padding: theme.spacing(0.5, 2), width: '68px' }} $background={theme.palette.common.white}>
              <Tooltip title={t({ id: 'edit' })}>
                <ButtonIcon size="medium" onClick={() => onRefCodeEdit(referenceCode)}>
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

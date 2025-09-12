import Box from '@mui/material/Box'
import { AddCircle, CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { CostCenterResponse, GetCostCentersResponse200 } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns, sortAllValues } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { TableCostCentersItems } from 'modules/cost-centers/components/TableCostCentersItems/TableCostCentersItems.component.tsx'

interface CollapsableCostCentersItemsProps {
  costCenters: GetCostCentersResponse200
  onCostCenterEdit: (id: string) => void
}

const CollapsableCostCentersItems = ({ costCenters, onCostCenterEdit }: CollapsableCostCentersItemsProps) => {
  return (
    <Box>
      <TableCostCentersItems data={costCenters} onCostCenterEdit={onCostCenterEdit} />
    </Box>
  )
}

interface TableCostCentersProps {
  data: GetCostCentersResponse200
  onCostCenterDialogOpen: () => void
  onCostCenterEdit: (id: string) => void
  isFetching: boolean
}

export const TableCostCenters = ({ data, onCostCenterDialogOpen, onCostCenterEdit, isFetching }: TableCostCentersProps) => {
  const { t } = useTranslations()

  const columns = createColumns<CostCenterResponse>()([
    {
      field: 'customerCode',
      headerName: t({ id: 'code' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '15%'
    },
    {
      field: 'name',
      headerName: t({ id: 'description' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '65%'
    },
    {
      field: 'active',
      headerName: t({ id: 'active' }),
      renderCell: (row) =>
        row.active ? <TickCircle color={paletteColors.green[600]} size={20} variant="Bold" /> : <CloseCircle color={paletteColors.red[600]} size={20} variant="Bold" />,
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '12.5%'
    },
    {
      field: 'actions',
      headerName: '',
      renderCell: (row) => (
        <Tooltip title={t({ id: 'edit' })}>
          <ButtonIcon size="medium" onClick={() => onCostCenterEdit(row.customerCode)} disabled={!hasPermission('cost_centers', 'edit')}>
            <Edit size={20} variant="Outline" />
          </ButtonIcon>
        </Tooltip>
      ),
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      sticky: true,
      width: '68px'
    }
  ])

  const sortingMode = 'client'

  const parentCostCenters = data.filter((costCenter) => {
    const hasChildren = data.some((item) => item.parent?.customerCode === costCenter.customerCode)
    const isParentless = !costCenter.parent

    return hasChildren || isParentless
  })

  return (
    <TableContainer>
      <TableContainer.Table
        aria-label="cost-centers-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'customerCode', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('cost_centers', 'create') ? (
            <ButtonPrimary startIcon={<AddCircle size={20} variant="Bold" />} onClick={onCostCenterDialogOpen}>
              {t({ id: 'createCostCenter' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('cost_centers', 'create') ? 'createCostCenterHint' : 'noCostCentersHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="client"
        sortingMode={sortingMode}
        rows={parentCostCenters ?? []}
        sx={{ minWidth: '50rem' }}
        collapsableRow={(row, orderBy, order) => {
          const childCostCenterCodes = data.filter((ref) => ref.parent?.customerCode === row.customerCode)

          if (sortingMode === 'client' && orderBy && order) {
            sortAllValues(childCostCenterCodes, columns, orderBy as keyof CostCenterResponse, order)
          }

          const hasChildCostCenerCodes = childCostCenterCodes.length > 0

          return hasChildCostCenerCodes ? <CollapsableCostCentersItems costCenters={childCostCenterCodes} onCostCenterEdit={onCostCenterEdit} /> : null
        }}
        getRowId={(row) => row.customerCode}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

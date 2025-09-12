import Box from '@mui/material/Box'
import { AddCircle, CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { GetRefCodesResponse200, RefCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns, sortAllValues } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { TableRefCodesItems } from 'modules/event-ref-codes/sections/TableRefCodesItems/TableRefCodesItems.component.tsx'

interface CollapsableReferenceCodesItemsProps {
  refCodes: GetRefCodesResponse200
  onRefCodeEdit: (id: string) => void
}

const CollapsableReferenceCodesItems = ({ refCodes, onRefCodeEdit }: CollapsableReferenceCodesItemsProps) => {
  return (
    <Box>
      <TableRefCodesItems data={refCodes} onRefCodeEdit={onRefCodeEdit} />
    </Box>
  )
}

interface TableRefCodesProps {
  data: GetRefCodesResponse200
  onRefCodeDialogOpen: () => void
  onRefCodeEdit: (id: string) => void
  isFetching: boolean
}

export const TableRefCodes = ({ data, onRefCodeDialogOpen, onRefCodeEdit, isFetching }: TableRefCodesProps) => {
  const { t } = useTranslations()

  const columns = createColumns<RefCodeResponse>()([
    {
      field: 'referenceCode',
      headerName: t({ id: 'code' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '15%'
    },
    {
      field: 'description',
      headerName: t({ id: 'description' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '72.5%'
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
          <ButtonIcon size="medium" onClick={() => onRefCodeEdit(row.referenceCode)} disabled={!hasPermission('event_codes', 'edit')}>
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

  const parentRefCodes = data.filter((refCode) => {
    const hasChildren = data.some((childRefCode) => childRefCode.parent?.referenceCode === refCode.referenceCode)
    const isParentless = !refCode.parent

    return hasChildren || isParentless
  })

  const sortingMode = 'client'

  return (
    <TableContainer>
      <TableContainer.Table
        aria-label="reference-codes-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'referenceCode', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('event_codes', 'create') ? (
            <ButtonPrimary startIcon={<AddCircle size={20} variant="Bold" />} onClick={onRefCodeDialogOpen}>
              {t({ id: 'createReferenceCode' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('event_codes', 'create') ? 'createReferenceCodeHint' : 'noReferenceCodesHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="client"
        sortingMode={sortingMode}
        rows={parentRefCodes}
        sx={{ minWidth: '50rem' }}
        collapsableRow={(row, orderBy, order) => {
          const childRefCodes = data.filter((ref) => ref.parent?.referenceCode === row.referenceCode)

          const hasChildRefCodes = childRefCodes.length > 0

          if (sortingMode === 'client' && orderBy && order) {
            sortAllValues(childRefCodes, columns, orderBy as keyof RefCodeResponse, order)
          }

          return hasChildRefCodes ? <CollapsableReferenceCodesItems refCodes={childRefCodes} onRefCodeEdit={onRefCodeEdit} /> : null
        }}
        getRowId={(row) => row.referenceCode}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

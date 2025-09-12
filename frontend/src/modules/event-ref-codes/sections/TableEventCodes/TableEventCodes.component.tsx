import { AddCircle, CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { EventCodeResponse, PostEventCodeResponse200 } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

interface TableEventCodesProps {
  data: PostEventCodeResponse200[]
  onEventCodeDialogOpen: () => void
  onEventCodeEdit: (id: string) => void
  isFetching: boolean
}

export const TableEventCodes = ({ data, onEventCodeDialogOpen, onEventCodeEdit, isFetching }: TableEventCodesProps) => {
  const { t } = useTranslations()

  const columns = createColumns<EventCodeResponse>()([
    {
      field: 'customerCode',
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
      width: '40%'
    },
    {
      field: 'debitReferenceCode',
      headerName: t({ id: 'debitReferenceCode' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '17.5%'
    },
    {
      field: 'creditReferenceCode',
      headerName: t({ id: 'creditReferenceCode' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '17.5%'
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
          <ButtonIcon size="medium" onClick={() => onEventCodeEdit(row.customerCode)} disabled={!hasPermission('event_codes', 'edit')}>
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

  return (
    <TableContainer>
      <TableContainer.Table
        aria-label="event-codes-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'customerCode', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('event_codes', 'create') ? (
            <ButtonPrimary startIcon={<AddCircle size={20} variant="Bold" />} onClick={onEventCodeDialogOpen}>
              {t({ id: 'createEventCode' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('event_codes', 'create') ? 'createEventCodeHint' : 'noEventCodesHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="client"
        sortingMode="client"
        rows={data ?? []}
        sx={{ minWidth: '50rem' }}
        getRowId={(row) => row.customerCode}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

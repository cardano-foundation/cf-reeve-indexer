import isoCountries from 'i18n-iso-countries'
import { AddCircle, CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { GetVatCodesResponse200, VatCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { formatNumberPercentage } from 'libs/utils/format.ts'

interface TableVatCodesProps {
  data: GetVatCodesResponse200
  onVatCodeDialogOpen: () => void
  onVatCodeEdit: (id: string) => void
  isFetching: boolean
}

export const TableVatCodes = ({ data, onVatCodeDialogOpen, onVatCodeEdit, isFetching }: TableVatCodesProps) => {
  const { t } = useTranslations()

  const columns = createColumns<VatCodeResponse>()([
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
      width: '35%'
    },
    {
      field: 'countryCode',
      headerName: t({ id: 'country' }),
      valueFormatter: (value) => isoCountries.getName(value, 'en') ?? '',
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '20%'
    },
    {
      field: 'rate',
      headerName: t({ id: 'rate' }),
      valueGetter: (value) => parseFloat(value),
      // NOTE: value here should be a number instead cause it
      // takes it from valueGetter, but table types needs to be adjusted
      valueFormatter: (value) => formatNumberPercentage(value),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '15%'
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
          <ButtonIcon size="medium" onClick={() => onVatCodeEdit(row.customerCode)} disabled={!hasPermission('vat_codes', 'edit')}>
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
        aria-label="vat-codes-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'customerCode', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('vat_codes', 'create') ? (
            <ButtonPrimary startIcon={<AddCircle size={20} variant="Bold" />} onClick={onVatCodeDialogOpen}>
              {t({ id: 'createVatCode' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('vat_codes', 'create') ? 'createVatCodesHint' : 'noVatCodesHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="client"
        sortingMode="client"
        rows={data ?? []}
        sx={{ minWidth: '93.75rem' }}
        getRowId={(row) => row.customerCode}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

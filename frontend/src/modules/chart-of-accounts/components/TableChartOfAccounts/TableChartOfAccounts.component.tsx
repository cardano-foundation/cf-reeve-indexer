import Box from '@mui/material/Box'
import { AddCircle, CloseCircle, Edit, TickCircle } from 'iconsax-react'

import { ChartOfAccount, GetChartOfAccountResponse200 } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types.ts'
import { OrganisationChartTypesResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetOrganisationChartTypesModel } from 'libs/models/organisation-model/GetOrganisationChartTypes/GetOrganisationChartTypesModel.service.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns, sortAllValues } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { getSubtypeOptions, getTypeOptions } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.utils.ts'
import { TableChartOfAccountsItems } from 'modules/chart-of-accounts/components/TableChartOfAccountsItems/TableChartOfAccountsItems.component.tsx'

interface CollapsableChartOfAccountsItemsProps {
  chartOfAccounts: GetChartOfAccountResponse200
  organisationChartTypes: OrganisationChartTypesResponse[] | null
  onChartOfAccountEdit: (id: string) => void
}

const CollapsableChartOfAccountsItems = ({ chartOfAccounts, organisationChartTypes, onChartOfAccountEdit }: CollapsableChartOfAccountsItemsProps) => {
  return (
    <Box>
      <TableChartOfAccountsItems data={chartOfAccounts} organisationChartTypes={organisationChartTypes} onChartOfAccountEdit={onChartOfAccountEdit} />
    </Box>
  )
}

interface TableChartOfAccountsProps {
  data: GetChartOfAccountResponse200
  onChartOfAccountDialogOpen: () => void
  onChartOfAccountEdit: (id: string) => void
  isFetching: boolean
}

export const TableChartOfAccounts = ({ data, onChartOfAccountDialogOpen, onChartOfAccountEdit, isFetching }: TableChartOfAccountsProps) => {
  const { t } = useTranslations()
  const selectedOrganisation = useSelectedOrganisation()

  const { organisationChartTypes } = useGetOrganisationChartTypesModel({ id: selectedOrganisation })

  const columns = createColumns<ChartOfAccount>()([
    {
      field: 'customerCode',
      headerName: t({ id: 'number' }),
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
      width: '35%'
    },
    {
      field: 'currency',
      headerName: t({ id: 'currency' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '15%'
    },
    {
      field: 'counterParty',
      headerName: t({ id: 'counterParty' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '20%'
    },
    {
      field: 'type',
      headerName: t({ id: 'type' }),
      valueGetter: (_, row) => {
        const typeName = row.type ? getTypeOptions(organisationChartTypes).find((chart) => chart.value === row.type)?.name || '' : ''

        return typeName
      },
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '17.5%'
    },
    {
      field: 'subType',
      headerName: t({ id: 'subType' }),
      valueGetter: (_, row) => {
        const subtypeName = row.type && row.subType ? getSubtypeOptions(organisationChartTypes, row.type, row.subType)[0]?.name || '' : ''

        return subtypeName
      },
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '27.5%'
    },
    {
      field: 'eventRefCode',
      headerName: t({ id: 'referenceCode' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '20%'
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
          <ButtonIcon size="medium" onClick={() => onChartOfAccountEdit(row.customerCode)} disabled={!hasPermission('chart_of_accounts', 'edit')}>
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

  const parentChartOfAccounts = data.filter((chart) => {
    const hasChildren = data.some((item) => item.parentCustomerCode === chart.customerCode)
    const isParentless = !chart.parentCustomerCode

    return hasChildren || isParentless
  })

  return (
    <TableContainer>
      <TableContainer.Table
        aria-label="chart-of-accounts-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'customerCode', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('chart_of_accounts', 'create') ? (
            <ButtonPrimary startIcon={<AddCircle size={20} variant="Bold" />} onClick={onChartOfAccountDialogOpen}>
              {t({ id: 'createAccount' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('chart_of_accounts', 'create') ? 'createAccountHint' : 'noAccountsHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="client"
        sortingMode={sortingMode}
        rows={parentChartOfAccounts ?? []}
        sx={{ minWidth: '93.75rem' }}
        collapsableRow={(row, orderBy, order) => {
          const childCustomerCodes = data.filter((ref) => ref.parentCustomerCode === row.customerCode)

          if (sortingMode === 'client' && orderBy && order) {
            sortAllValues(childCustomerCodes, columns, orderBy as keyof ChartOfAccount, order)
          }

          const hasChildCustomerCodes = childCustomerCodes.length > 0

          return hasChildCustomerCodes ? (
            <CollapsableChartOfAccountsItems chartOfAccounts={childCustomerCodes} organisationChartTypes={organisationChartTypes} onChartOfAccountEdit={onChartOfAccountEdit} />
          ) : null
        }}
        getRowId={(row) => row.customerCode}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import dayjs from 'dayjs'
import { Danger, ImportSquare, RefreshCircle } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { BatchApiResponse, BatchesApiResponse, BatchStatus } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { CardCounterApprove } from 'libs/form-kit/components/CardCounterApprove/CardCounterApprove.component.tsx'
import { CardCounterInvalid } from 'libs/form-kit/components/CardCounterInvalid/CardCounterInvalid.component.tsx'
import { CardCounterPending } from 'libs/form-kit/components/CardCounterPending/CardCounterPending.component.tsx'
import { CardCounterPublish } from 'libs/form-kit/components/CardCounterPublish/CardCounterPublish.component.tsx'
import { CardCounterPublished } from 'libs/form-kit/components/CardCounterPublished/CardCounterPublished.component.tsx'
import { useBatchRedirection } from 'libs/hooks/useBatchRedirection.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { FiltersBatches } from 'libs/ui-kit/components/FiltersBatches/FiltersBatches.component.tsx'
import { StatusOption, useFilters } from 'libs/ui-kit/components/FiltersBatches/hooks/useFilters.ts'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { PATHS } from 'routes'

interface CollapsableCardsProps {
  batch: BatchApiResponse
}

const CollapsableCards = ({ batch }: CollapsableCardsProps) => {
  const { batchStatistics } = batch

  const { handleCardApproveClick, handleCardInvalidClick, handleCardPendingClick, handleCardPublishClick, handleCardPublishedClick } = useBatchRedirection({ batch })

  return (
    <Grid container px={3} py={2} spacing={2}>
      <Grid size={{ xs: 6, md: 4, xl: 'grow' }}>
        <CardCounterApprove count={batchStatistics.approve} onClick={handleCardApproveClick} />
      </Grid>
      <Grid size={{ xs: 6, md: 4, xl: 'grow' }}>
        <CardCounterPending count={batchStatistics.pending} onClick={handleCardPendingClick} />
      </Grid>
      <Grid size={{ xs: 6, md: 4, xl: 'grow' }}>
        <CardCounterInvalid count={batchStatistics.invalid} onClick={handleCardInvalidClick} />
      </Grid>
      <Grid size={{ xs: 6, md: 4, xl: 'grow' }}>
        <CardCounterPublish count={batchStatistics.publish} onClick={handleCardPublishClick} />
      </Grid>
      <Grid size={{ xs: 6, md: 4, xl: 'grow' }}>
        <CardCounterPublished count={batchStatistics.published} onClick={handleCardPublishedClick} />
      </Grid>
    </Grid>
  )
}

interface BatchesAllFilters extends ReturnType<typeof useFilters> {
  filterStatusOptions: StatusOption[]
  preselectedOrganisation?: OrganisationApiResponse
}

interface BatchesAllPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface TableBatchesAllProps {
  data: BatchesApiResponse | null
  filters: BatchesAllFilters
  pagination: BatchesAllPagination
  isFetching: boolean
}

export const TableBatchesAll = ({ data, filters, pagination, isFetching }: TableBatchesAllProps) => {
  const { filterStatusOptions, preselectedOrganisation, selectedDate, selectedStatus, handleDateChange, handleStatusChange, handleFiltersReset, areFiltersSelected } = filters
  const { handlePagination } = pagination

  const { t } = useTranslations()

  const theme = useTheme()

  const columns = createColumns<BatchApiResponse>()([
    {
      field: 'id',
      headerName: t({ id: 'batchId' }),
      renderCell: (row) => (
        <Tooltip title={row.id}>
          <Box component="span">{row.id.length > 8 ? `${row.id.substring(0, 4)}...${row.id.substring(row.id.length - 4)}` : row.id}</Box>
        </Tooltip>
      ),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '25%'
    },
    {
      field: 'createdAt',
      headerName: t({ id: 'importedOn' }),
      valueFormatter: (value) => dayjs(value).format('DD/MM/YYYY'),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '25%'
    },
    { field: 'createdBy', headerName: t({ id: 'importedBy' }), align: 'left', headerAlign: 'left', sortable: true, width: '17.5%' },
    {
      field: 'transactionsCount',
      headerName: t({ id: 'numberOfTransactions' }),
      valueGetter: (_, row) => row.batchStatistics.total,
      valueFormatter: (value) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      width: '30%'
    },
    {
      field: 'status',
      headerName: '',
      renderCell: (row) => {
        const { status } = row

        if (status === BatchStatus.FAILED) {
          return (
            <Tooltip title={t({ id: 'batchFailedTooltip' })} placement="left">
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Danger color={theme.palette.error.dark} size={24} variant="Bold" />
              </Box>
            </Tooltip>
          )
        }

        if (![BatchStatus.FINALIZED, BatchStatus.FINISHED].includes(status)) {
          return (
            <Tooltip title={t({ id: 'batchProcessingTooltip' })} placement="left">
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <RefreshCircle color={theme.palette.primary.dark} size={24} variant="Bold" />
              </Box>
            </Tooltip>
          )
        }

        return null
      },
      align: 'left',
      headerAlign: 'left',
      width: '68px'
    }
  ])

  return (
    <TableContainer>
      {preselectedOrganisation && (
        <FiltersBatches
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          preselectedOrganisation={preselectedOrganisation}
          selectedStatus={selectedStatus}
          handleStatusChange={handleStatusChange}
          areFiltersSelected={areFiltersSelected}
          handleFiltersReset={handleFiltersReset}
          filterStatusOptions={filterStatusOptions}
        />
      )}
      <TableContainer.Table
        aria-label="batches-all-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('transactions', 'import') ? (
            <ButtonPrimary component={RouterLink} startIcon={<ImportSquare size={20} variant="Bold" />} to={PATHS.TRANSACTIONS_IMPORT}>
              {t({ id: 'importBatch' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('transactions', 'import') ? 'importBatchHint' : 'noBatchesHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="server"
        sortingMode="client"
        totalRows={data?.total}
        rows={data?.batchs}
        sx={{ minWidth: '50rem' }}
        collapsableRow={(batch) => ([BatchStatus.FINALIZED, BatchStatus.FINISHED].includes(batch.status) ? <CollapsableCards batch={batch as BatchApiResponse} /> : null)}
        onPagination={handlePagination}
        hasFiltersSelected={areFiltersSelected}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

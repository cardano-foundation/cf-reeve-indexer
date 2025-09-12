import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import dayjs from 'dayjs'

import { BatchApiResponse, BatchesApiResponse } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { CardCounterPublish } from 'libs/form-kit/components/CardCounterPublish/CardCounterPublish.component.tsx'
import { CardCounterPublished } from 'libs/form-kit/components/CardCounterPublished/CardCounterPublished.component.tsx'
import { useBatchPublishRedirection } from 'libs/hooks/useBatchRedirection.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { FiltersBatches } from 'libs/ui-kit/components/FiltersBatches/FiltersBatches.component.tsx'
import { StatusOption, useFilters } from 'libs/ui-kit/components/FiltersBatches/hooks/useFilters.ts'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'

interface CollapsableCardsProps {
  batch: BatchApiResponse
}

const CollapsableCards = ({ batch }: CollapsableCardsProps) => {
  const { batchStatistics } = batch

  const { handleCardPublishClick, handleCardPublishedClick } = useBatchPublishRedirection({ batch, isPublish: true })

  return (
    <Grid container px={3} py={2} spacing={2}>
      <Grid size={{ xs: 6, xl: 'grow' }}>
        <CardCounterPublish count={batchStatistics.publish} onClick={handleCardPublishClick} />
      </Grid>
      <Grid size={{ xs: 6, xl: 'grow' }}>
        <CardCounterPublished count={batchStatistics.published} onClick={handleCardPublishedClick} />
      </Grid>
    </Grid>
  )
}

interface BatchesPublishFilters extends ReturnType<typeof useFilters> {
  filterStatusOptions: StatusOption[]
  preselectedOrganisation?: OrganisationApiResponse
}

interface BatchesPublishPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface TableBatchesPublishProps {
  data: BatchesApiResponse | null
  filters: BatchesPublishFilters
  pagination: BatchesPublishPagination
  isFetching: boolean
}

export const TableBatchesPublish = ({ data, filters, pagination, isFetching }: TableBatchesPublishProps) => {
  const { filterStatusOptions, preselectedOrganisation, selectedDate, selectedStatus, handleDateChange, handleStatusChange, handleFiltersReset, areFiltersSelected } = filters
  const { handlePagination } = pagination

  const { t } = useTranslations()

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
      valueFormatter: (value) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      valueGetter: (_, row) => row.batchStatistics.total,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      width: '30%'
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
          hasStatusFilter={false}
        />
      )}
      <TableContainer.Table
        aria-label="batches-publish-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsHint={t({ id: 'noPublishBatchesHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="server"
        sortingMode="client"
        totalRows={data?.total}
        rows={data?.batchs}
        sx={{ minWidth: '50rem' }}
        collapsableRow={(batch) => <CollapsableCards batch={batch as BatchApiResponse} />}
        onPagination={handlePagination}
        hasFiltersSelected={areFiltersSelected}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}

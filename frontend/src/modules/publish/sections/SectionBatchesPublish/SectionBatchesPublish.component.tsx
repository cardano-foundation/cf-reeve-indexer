import { useEffect } from 'react'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useGetBatchesModel } from 'libs/models/batches-model/GetBatches/GetBatches.service.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { StatusOption, useFilters } from 'libs/ui-kit/components/FiltersBatches/hooks/useFilters.ts'
import { TableBatchesPublish } from 'modules/publish/components/TableBatchesPublish/TableBatchesPublish.component.tsx'

const filterStatusOptions: StatusOption[] = [
  { name: intl.formatMessage({ id: 'batchPublish' }), value: BatchStatistics.PUBLISH },
  { name: intl.formatMessage({ id: 'batchPublished' }), value: BatchStatistics.PUBLISHED }
]

export const SectionBatchesPublish = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { organisations } = useGetOrganisationsModel()

  const { selectedStatus, selectedDate, handleStatusChange, handleDateChange, handleFiltersReset, areFiltersSelected } = useFilters(filterStatusOptions)
  const { page, rowsPerPage, handlePagination } = usePagination()

  const selectedStatusValues = selectedStatus.map((option) => option.value)

  const { batches, refetch, isFetching } = useGetBatchesModel(
    {
      organisationId: selectedOrganisation,
      batchStatistics: selectedStatusValues.length > 0 ? selectedStatusValues : [BatchStatistics.PUBLISH],
      from: selectedDate?.format('YYYY-MM-DD'),
      to: selectedDate?.format('YYYY-MM-DD')
    },
    { page, size: rowsPerPage }
  )

  const preselectedOrganisation = organisations?.find((item) => item.id === selectedOrganisation)

  useEffect(() => {
    refetch()
  }, [selectedStatus, selectedDate, page, rowsPerPage])

  return (
    <TableBatchesPublish
      data={batches}
      filters={{
        filterStatusOptions,
        preselectedOrganisation,
        selectedDate,
        selectedStatus,
        handleDateChange,
        handleStatusChange,
        handleFiltersReset,
        areFiltersSelected
      }}
      pagination={{ handlePagination }}
      isFetching={isFetching}
    />
  )
}

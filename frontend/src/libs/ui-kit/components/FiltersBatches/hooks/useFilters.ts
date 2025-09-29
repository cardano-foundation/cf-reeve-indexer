import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material'
import { Dayjs } from 'dayjs'
import { ReactElement, ReactNode, ReactPortal, SyntheticEvent, useState } from 'react'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-reeve/api/batches/batchesApi.types.ts'

export interface StatusOption {
  name: string | number | boolean | ReactElement | Iterable<ReactNode> | ReactPortal | (string | undefined)[] | null | undefined
  value: BatchStatistics
}

interface AutocompleteMultipleOption {
  name: string | number | boolean | ReactElement | Iterable<ReactNode> | ReactPortal | (string | undefined)[] | null | undefined
  value: string | number
}

export const useFilters = (filterStatusOptions: StatusOption[]) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusOption[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)

  const handleStatusChange = (
    _event: SyntheticEvent<Element, Event>,
    value: AutocompleteMultipleOption[],
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<AutocompleteMultipleOption> | undefined
  ) => {
    const statusOptions: StatusOption[] = value.map((option) => {
      const selectedOption = filterStatusOptions.find((statusOption) => statusOption.value === (option.value as BatchStatistics))
      return selectedOption || { name: option.name, value: option.value as BatchStatistics }
    })

    setSelectedStatus(statusOptions)
  }

  const handleDateChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate)
  }

  const handleFiltersReset = () => {
    setSelectedStatus([])
    setSelectedDate(null)
  }

  const areFiltersSelected = selectedStatus.length > 0 || Boolean(selectedDate)

  return {
    selectedStatus,
    selectedDate,
    handleStatusChange,
    handleDateChange,
    handleFiltersReset,
    areFiltersSelected
  }
}

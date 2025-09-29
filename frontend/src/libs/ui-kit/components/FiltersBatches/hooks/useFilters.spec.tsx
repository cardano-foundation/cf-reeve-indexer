import { act, renderHook } from '@testing-library/react'
import dayjs from 'dayjs'
import { it } from 'vitest'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-reeve/api/batches/batchesApi.types.ts'

import { useFilters, StatusOption } from './useFilters'

const mockEvent: React.SyntheticEvent = {
  currentTarget: document.createElement('div'),
  target: document.createElement('div'),
  bubbles: false,
  cancelable: false,
  defaultPrevented: false,
  eventPhase: 0,
  isTrusted: false,
  preventDefault: () => {},
  isDefaultPrevented: () => false,
  stopPropagation: () => {},
  isPropagationStopped: () => false,
  persist: () => {},
  timeStamp: Date.now(),
  type: 'select-option',
  nativeEvent: new Event('select-option')
} as React.SyntheticEvent<Element, Event>

describe('useFilters', () => {
  it('should handle status change', async () => {
    const filterStatusOptions: StatusOption[] = [
      { name: 'Option 1', value: BatchStatistics.APPROVE },
      { name: 'Option 2', value: BatchStatistics.PENDING }
    ]
    const newStatus: StatusOption = { name: 'Option 1', value: BatchStatistics.APPROVE }

    const { result } = renderHook(() => useFilters(filterStatusOptions))

    await act(async () => {
      result.current.handleStatusChange(mockEvent, [newStatus], 'selectOption')
    })

    expect(result.current.selectedStatus[0]?.name).toEqual('Option 1')
  })

  it('should handle date change', async () => {
    const filterStatusOptions: StatusOption[] = []

    const { result } = renderHook(() => useFilters(filterStatusOptions))

    await act(async () => {
      result.current.handleDateChange(dayjs())
    })

    expect(result.current.selectedDate?.toString()).toEqual(dayjs().toString())
  })

  it('should handle filters reset', async () => {
    const filterStatusOptions: StatusOption[] = [{ name: 'Option 1', value: BatchStatistics.PENDING }]

    const { result } = renderHook(() => useFilters(filterStatusOptions))

    await act(async () => {
      result.current.handleFiltersReset()
    })

    expect(result.current.selectedStatus).toHaveLength(0)
    expect(result.current.selectedDate).toBeNull()
  })
})

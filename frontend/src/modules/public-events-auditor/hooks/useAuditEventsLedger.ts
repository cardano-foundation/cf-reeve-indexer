import { useEffect, useState } from 'react'

import { PostPublicEventsRequest } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useGetPublicEventsModel } from 'libs/models/events-model/GetPublicEvents/GetPublicEventsModel.service'

/** The grant event types the audit ledger is scoped to when the user hasn't narrowed by type. */
const GRANT_EVENT_TYPES = ['FUNDING', 'SPENDING', 'REFUND']
const SEARCH_DEBOUNCE_MS = 300

/**
 * Server-driven state for the audit events ledger: pagination, sorting, a type filter and a
 * debounced free-text search, all pushed to the events search endpoint (`POST /api/v1/events`).
 * Scoped to the organisation, the grant event types and the page's reporting period; disabled until
 * an organisation is selected.
 */
export const useAuditEventsLedger = (organisationId: string, dateFrom?: string, dateTo?: string, projectIds: string[] = []) => {
  const pagination = usePagination()
  const sorting = useSorting({ field: 'date', sort: 'desc' })
  const { page, rowsPerPage, handlePagination } = pagination
  const { sortBy, sortOrder, handleSorting } = sorting

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [search, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [search])

  const typesKey = selectedTypes.join(',')

  // Reset to the first page synchronously whenever a filter/sort changes, so the next fetch uses
  // page 0 rather than firing once with the stale page and again after an effect corrects it.
  const resetPage = () => handlePagination(0, rowsPerPage)

  const toggleType = (type: string) => {
    resetPage()
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((value) => value !== type) : [...prev, type]))
  }

  const setSearch = (value: string) => {
    resetPage()
    setSearchValue(value)
  }

  const handleSort = (field: string, order: 'asc' | 'desc' | null | undefined) => {
    resetPage()
    handleSorting(field, order)
  }

  const projectsKey = projectIds.join(',')

  // The reporting period and project filter come from parent page controls, so reset the page
  // reactively when either changes.
  useEffect(() => {
    handlePagination(0, rowsPerPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, projectsKey])

  const eventTypes = selectedTypes.length > 0 ? selectedTypes : GRANT_EVENT_TYPES

  const request: PostPublicEventsRequest = {
    parameters: { page, size: rowsPerPage, sort: [`${sortBy},${sortOrder ?? 'desc'}`] },
    body: {
      organisationId,
      eventTypes,
      ...(projectIds.length ? { projectIds } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {})
    }
  }

  const { events: data, isEventsFetching } = useGetPublicEventsModel(
    request,
    ['AUDIT_LEDGER', organisationId, typesKey, projectsKey, debouncedSearch, dateFrom, dateTo, page, rowsPerPage, sortBy, sortOrder],
    Boolean(organisationId)
  )

  return {
    events: data?.events ?? [],
    total: data?.total ?? 0,
    isFetching: isEventsFetching,
    page,
    rowsPerPage,
    onPaginationChange: handlePagination,
    sortBy,
    sortOrder,
    onSortChange: handleSort,
    selectedTypes,
    toggleType,
    search,
    setSearch,
    hasFilters: selectedTypes.length > 0 || debouncedSearch.length > 0
  }
}

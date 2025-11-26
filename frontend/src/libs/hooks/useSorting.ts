import { useState } from 'react'

export const SORTING_CONFIG = {
  ORDER: 10
}

interface SortingState {
  field: string
  sort: 'asc' | 'desc'
}

export const useSorting = (state: SortingState) => {
  const { field, sort } = state

  const [sortBy, setSortBy] = useState<string>(field)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null | undefined>(sort)

  const handleSorting = (field: string, order: 'asc' | 'desc' | null | undefined) => {
    setSortBy(field)
    setSortOrder(order)
  }

  return {
    sortBy,
    sortOrder,
    handleSorting
  }
}

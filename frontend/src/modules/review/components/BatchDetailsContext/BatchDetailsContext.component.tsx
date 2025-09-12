import { createContext, type ReactNode } from 'react'

import type { BatchDetailsFiltersValues, BatchDetailsQuickFiltersValues } from 'features/ui'

interface BatchDetailsContextProps {
  count: number
  filters: BatchDetailsFiltersValues
  quickFilters: BatchDetailsQuickFiltersValues
  areFiltersSubmitted: boolean
}

export const BatchDetailsContext = createContext<BatchDetailsContextProps | undefined>(undefined)

interface BatchDetailsContextProviderProps {
  children: ReactNode
  value?: BatchDetailsContextProps
}

export const BatchDetailsContextProvider = ({ children, value }: BatchDetailsContextProviderProps) => {
  return <BatchDetailsContext.Provider {...{ value }}>{children}</BatchDetailsContext.Provider>
}

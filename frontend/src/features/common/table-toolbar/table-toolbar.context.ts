import { createContext } from 'react'

import type { QuickFiltersContextProps, TableToolbarContextProps } from './table-toolbar.types'

export const TableToolbarContext = createContext<TableToolbarContextProps | undefined>(undefined)

export const QuickFiltersContext = createContext<QuickFiltersContextProps | undefined>(undefined)

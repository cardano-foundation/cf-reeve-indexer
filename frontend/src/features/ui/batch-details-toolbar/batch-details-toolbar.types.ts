import { type Dayjs } from 'dayjs'

import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext'

import { DEFAULT_QUICK_FILTERS_VALUES } from './batch-details-toolbar.consts'

export interface BatchDetailsQuickFiltersValues {
  search: string
  dateFrom: Dayjs | null
  dateTo: Dayjs | null
  transactionType: string[]
}

export interface BatchDetailsQuickFiltersProps {
  isDrawerOpen: ReturnType<typeof useLayoutAuthContext>['isDrawerOpen']
}

export interface BatchDetailsActionControlsProps {
  count: number
  drawerType: ReturnType<typeof useLayoutAuthContext>['type']
  onDrawerOpen: ReturnType<typeof useLayoutAuthContext>['handleDrawerOpen']
  isDrawerOpen: ReturnType<typeof useLayoutAuthContext>['isDrawerOpen']
}

export interface BatchDetailsQuickFiltersState {
  initialValues: typeof DEFAULT_QUICK_FILTERS_VALUES
}

import { type MouseEvent, type ReactNode, type RefObject } from 'react'

import { type DrawerType } from 'consts'
import { type GridProps } from 'features/mui/base'

interface DrawerProps {
  type: DrawerType | null
  onDrawerOpen: (event: MouseEvent<HTMLElement>, newValue: DrawerType) => void
  isDrawerOpen: boolean
}

export interface TableToolbarContextProps {
  drawer: DrawerProps
  visibilityCount: number
  childRefs: RefObject<HTMLDivElement[]>
  toolbarRef: RefObject<HTMLDivElement | null>
  hasFiltersTouched: boolean
}

export type QuickFiltersContextProps = boolean

export interface QuickFiltersMeasureState {
  childRefs: RefObject<HTMLDivElement[]>
  toolbarRef: RefObject<HTMLDivElement | null>
}

export interface QuickFilterFieldGroupProps extends GridProps {}

export interface QuickFiltersFieldProps extends GridProps {}

export interface ActionControlsProps {
  children: ReactNode
}

export interface QuickFiltersProps {
  children: ReactNode
  isFirstFieldSkipped?: boolean
}

export interface TableToolbarProps {
  children: ReactNode
  drawer: DrawerProps
  hasFiltersTouched: boolean
}

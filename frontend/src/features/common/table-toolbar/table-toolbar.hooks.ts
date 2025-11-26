import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'

import { useDebouncedResizeObserver } from 'hooks'

import { QuickFiltersContext, TableToolbarContext } from './table-toolbar.context'
import type { QuickFiltersMeasureState } from './table-toolbar.types'

export const useTableToolbarContext = () => {
  const context = useContext(TableToolbarContext)

  if (!context) {
    throw new Error('useTableToolbarContext must be used within a TableToolbarContext')
  }

  return context
}

export const useQuickFiltersContext = () => {
  const context = useContext(QuickFiltersContext)

  if (!context) {
    throw new Error('useQuickFiltersContext must be used within a QuickFiltersContext')
  }

  return context
}

const useQuickFiltersMeasure = (state: QuickFiltersMeasureState) => {
  const { childRefs, toolbarRef } = state

  const [visibilityCount, setVisibilityCount] = useState<number>(childRefs.current.length)

  const measureAvailableSpace = useCallback(() => {
    if (!toolbarRef.current) return

    const gridWidth = toolbarRef.current?.offsetWidth || 0
    const gapsWidth = (childRefs.current.length - 1) * 16

    const { count } = childRefs.current.reduce(
      (acc, child) => {
        if (acc.done) return acc

        const childWidth = child?.getBoundingClientRect().width || 0

        if (acc.total + childWidth + gapsWidth <= gridWidth) {
          return {
            total: acc.total + childWidth + 16,
            count: acc.count + 1,
            done: false
          }
        } else {
          return { ...acc, done: true }
        }
      },
      { total: 0, count: 0, done: false }
    )

    setVisibilityCount(count)
  }, [childRefs, toolbarRef])

  useLayoutEffect(() => {
    measureAvailableSpace()
  }, [measureAvailableSpace])

  useDebouncedResizeObserver(toolbarRef, measureAvailableSpace)

  return { visibilityCount }
}

export const useQuickFiltersFieldGroup = () => {
  const context = useQuickFiltersContext()

  return context
}

export const useQuickFiltersField = () => {
  const context = useQuickFiltersContext()

  return context
}

export const useActionControls = () => {
  const { drawer, hasFiltersTouched } = useTableToolbarContext()

  return { drawer, hasFiltersTouched }
}

export const useQuickFilters = () => {
  const { drawer, visibilityCount, childRefs, toolbarRef, hasFiltersTouched } = useTableToolbarContext()

  return { drawer, visibilityCount, childRefs, toolbarRef, hasFiltersTouched }
}

export const useTableToolbar = () => {
  const childRefs = useRef<HTMLDivElement[]>([])
  const toolbarRef = useRef<HTMLDivElement | null>(null)

  const { visibilityCount } = useQuickFiltersMeasure({ childRefs, toolbarRef })

  return { visibilityCount, childRefs, toolbarRef }
}

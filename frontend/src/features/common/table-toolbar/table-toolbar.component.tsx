import { Form } from 'formik'
import { Children, cloneElement, useLayoutEffect, useRef, useState } from 'react'

import { Grid } from 'features/mui/base'
import { useDebouncedResizeObserver } from 'hooks'

import type { ActionControlsProps, QuickFiltersProps, TableToolbarProps } from './table-toolbar.types'

const QuickFilters = ({ children, gap = 16 }: QuickFiltersProps) => {
  const [count, setCount] = useState(Children.count(children))

  const gridRef = useRef<HTMLDivElement | null>(null)
  const childRefs = useRef<HTMLDivElement[]>([])

  const measureAvailableSpace = () => {
    if (!gridRef.current) return

    const gridWidth = gridRef.current?.offsetWidth || 0
    const gapsWidth = (Children.count(children) - 1) * gap

    const { count } = childRefs.current.reduce(
      (acc, child, index) => {
        if (acc.done) return acc

        const childWidth = child?.getBoundingClientRect().width || 0

        if (acc.total + childWidth + gapsWidth <= gridWidth) {
          return {
            total: acc.total + childWidth + index * gap,
            count: acc.count + 1,
            done: false
          }
        } else {
          return { ...acc, done: true }
        }
      },
      { total: 0, count: 0, done: false }
    )

    setCount(count)
  }

  useDebouncedResizeObserver(gridRef, measureAvailableSpace)

  useLayoutEffect(() => {
    measureAvailableSpace()
  }, [])

  return (
    <Grid container size="grow" spacing={2}>
      <Grid container size="grow">
        <Form style={{ width: '100%' }}>
          <Grid container ref={gridRef} size="grow" spacing={2} wrap="nowrap">
            {Children.map(children, (child, index) =>
              cloneElement(child as React.ReactElement, {
                ref: (el: HTMLDivElement | null) => {
                  if (el) childRefs.current[index] = el as HTMLDivElement
                },
                key: index,
                sx: {
                  whiteSpace: 'nowrap',
                  visibility: index < count ? 'visible' : 'hidden',
                  position: index < count ? 'static' : 'absolute',
                  pointerEvents: index < count ? 'auto' : 'none'
                }
              })
            )}
          </Grid>
        </Form>
      </Grid>
    </Grid>
  )
}

const ActionControls = ({ children }: ActionControlsProps) => {
  return (
    <Grid container size="auto">
      {children}
    </Grid>
  )
}

export const TableToolbar = ({ children }: TableToolbarProps) => {
  return <>{children}</>
}

TableToolbar.QuickFilters = QuickFilters
TableToolbar.ActionControls = ActionControls

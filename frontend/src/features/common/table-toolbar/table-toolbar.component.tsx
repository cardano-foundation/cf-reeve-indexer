import { Form } from 'formik'
import { Children, cloneElement, forwardRef, type ReactElement } from 'react'

import { Grid } from 'features/mui/base'

import { QuickFiltersContext, TableToolbarContext } from './table-toolbar.context'
import { useActionControls, useQuickFilters, useQuickFiltersField, useQuickFiltersFieldGroup, useTableToolbar } from './table-toolbar.hooks'
import type { ActionControlsProps, QuickFilterFieldGroupProps, QuickFiltersFieldProps, QuickFiltersProps, TableToolbarProps } from './table-toolbar.types'

const QuickFiltersFieldGroup = forwardRef<HTMLDivElement, QuickFilterFieldGroupProps>(({ children, ...props }, ref) => {
  useQuickFiltersFieldGroup()

  return (
    <Grid container flexWrap="nowrap" size="auto" spacing={2} {...{ ref, ...props }}>
      {children}
    </Grid>
  )
})

QuickFiltersFieldGroup.displayName = 'QuickFilterFieldGroup'

const QuickFiltersField = forwardRef<HTMLDivElement, QuickFiltersFieldProps>(({ children, ...props }, ref) => {
  useQuickFiltersField()

  return (
    <Grid width="16rem" size="auto" {...{ ref, ...props }}>
      {children}
    </Grid>
  )
})

QuickFiltersField.displayName = 'QuickFilterField'

const QuickFilters = ({ children, isFirstFieldSkipped = false }: QuickFiltersProps) => {
  const { drawer, visibilityCount, childRefs, toolbarRef } = useQuickFilters()

  const { isDrawerOpen } = drawer

  return (
    <QuickFiltersContext.Provider value={true}>
      <Grid container size="grow" spacing={2}>
        <Form style={{ width: '100%' }} noValidate>
          <Grid container ref={toolbarRef} size="grow" spacing={2} wrap="nowrap">
            {Children.toArray(children).map((child, index, array) => {
              const isField = (child as ReactElement)?.type === QuickFiltersField || (child as ReactElement)?.type === QuickFiltersFieldGroup

              const count = array.reduce<number>(
                (acc, child) => (!((child as ReactElement)?.type === QuickFiltersField || (child as ReactElement)?.type === QuickFiltersFieldGroup) ? acc + 1 : acc),
                0
              )

              return isField
                ? cloneElement(child as ReactElement<HTMLDivElement>, {
                    ref: (el: HTMLDivElement) => {
                      if (el) childRefs.current[index] = el as HTMLDivElement
                    },
                    key: index,
                    sx: {
                      whiteSpace: 'nowrap',
                      position: isFirstFieldSkipped && index === 0 ? 'static' : !isDrawerOpen && index + 1 - count <= visibilityCount ? 'static' : 'absolute',
                      visibility: isFirstFieldSkipped && index === 0 ? 'visible' : !isDrawerOpen && index + 1 - count <= visibilityCount ? 'visible' : 'hidden',
                      pointerEvents: isFirstFieldSkipped && index === 0 ? 'auto' : !isDrawerOpen && index + 1 - count <= visibilityCount ? 'auto' : 'none'
                    }
                  })
                : child
            })}
          </Grid>
        </Form>
      </Grid>
    </QuickFiltersContext.Provider>
  )
}

QuickFilters.Field = QuickFiltersField
QuickFilters.FieldGroup = QuickFiltersFieldGroup

const ActionControls = ({ children }: ActionControlsProps) => {
  useActionControls()

  return (
    <Grid container size="auto">
      {children}
    </Grid>
  )
}

export const TableToolbar = ({ children, drawer, hasFiltersTouched }: TableToolbarProps) => {
  const { visibilityCount, childRefs, toolbarRef } = useTableToolbar()

  return <TableToolbarContext.Provider value={{ drawer, visibilityCount, childRefs, toolbarRef, hasFiltersTouched }}>{children}</TableToolbarContext.Provider>
}

TableToolbar.QuickFilters = QuickFilters
TableToolbar.ActionControls = ActionControls

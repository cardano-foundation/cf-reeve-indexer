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

const QuickFilters = ({ children, isFirstFieldSkipped = false, isLastFieldSkipped = false }: QuickFiltersProps) => {
  const { drawer, visibilityCount, childRefs, toolbarRef } = useQuickFilters()

  const { isDrawerOpen } = drawer

  const items = Children.toArray(children)
  const isFieldItem = (item: (typeof items)[number]) => (item as ReactElement)?.type === QuickFiltersField || (item as ReactElement)?.type === QuickFiltersFieldGroup
  const fields = items.filter(isFieldItem)
  const count = items.length - fields.length

  return (
    <QuickFiltersContext.Provider value={true}>
      <Grid container size="grow" spacing={2}>
        <Form style={{ width: '100%' }} noValidate>
          <Grid
            container
            ref={toolbarRef}
            size="grow"
            spacing={2}
            wrap="nowrap"
            sx={(theme) => ({
              ...(isLastFieldSkipped && { position: 'relative' }),
              '& .MuiFormHelperText-root': {
                position: 'absolute',
                top: '100%',
                transform: 'translateY(-50%)',
                margin: '0 0 0 10px',
                padding: '0 4px',
                lineHeight: 1,
                background: theme.palette.background.default
              }
            })}
          >
            {items.map((child, index) => {
              const isField = isFieldItem(child)

              const fieldIndex = fields.indexOf(child)
              const isLastField = isLastFieldSkipped && fieldIndex === fields.length - 1
              const measureIndex = isLastField ? 0 : fieldIndex + 1

              const isSkipped = (isFirstFieldSkipped && index === 0) || isLastField
              const isVisible = isSkipped || (!isDrawerOpen && (isLastFieldSkipped ? measureIndex + 1 : index + 1 - count) <= visibilityCount)

              return isField
                ? cloneElement(child as ReactElement<HTMLDivElement>, {
                    ref: (el: HTMLDivElement) => {
                      if (el) childRefs.current[isLastFieldSkipped ? measureIndex : index] = el as HTMLDivElement
                    },
                    key: index,
                    sx: {
                      whiteSpace: 'nowrap',
                      position: isVisible ? 'static' : isLastFieldSkipped ? 'absolute' : 'relative',
                      visibility: isVisible ? 'visible' : 'hidden',
                      pointerEvents: isVisible ? 'auto' : 'none'
                    }
                  })
                : isLastFieldSkipped && (isDrawerOpen || visibilityCount <= 1)
                  ? null
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

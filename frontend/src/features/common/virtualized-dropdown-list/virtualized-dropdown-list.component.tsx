import { useVirtualizer } from '@tanstack/react-virtual'
import { Children, forwardRef, useRef } from 'react'

import { VirtualizedDropdownListInnerStyled, VirtualizedDropdownListOuterStyled, VirtualizedDropdownListStyled } from './virtualized-dropdown-list.styles'
import type { VirtualizedDropdownListProps } from './virtualized-dropdown-list.types'

export const VirtualizedDropdownList = forwardRef<HTMLElement, VirtualizedDropdownListProps>(({ children, role, ...props }, ref) => {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: Children.count(children),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 54
  })

  return (
    <VirtualizedDropdownListStyled {...{ ref }}>
      <VirtualizedDropdownListOuterStyled ref={parentRef} $height={virtualizer.getTotalSize()} {...{ role, ...props }}>
        {virtualizer.getVirtualItems().map((item) => (
          <VirtualizedDropdownListInnerStyled key={item.key} $translate={item.start}>
            {Children.toArray(children)[item.index]}
          </VirtualizedDropdownListInnerStyled>
        ))}
      </VirtualizedDropdownListOuterStyled>
    </VirtualizedDropdownListStyled>
  )
})

VirtualizedDropdownList.displayName = 'VirtualizedDropdownList'

import { MouseEvent, ReactNode, useMemo } from 'react'

import { CardAnalytics } from 'modules/dashboard-builder/components/CardAnalytics/CardAnalytics.component.tsx'
import { CardSlot } from 'modules/dashboard-builder/components/CardSlot/CardSlot.component.tsx'
import { TemplateSlotContextProvider } from 'modules/dashboard-builder/components/TemplateSlotContext/TemplateSlotContext.component.tsx'
import { DASHBOARD_BUILDER_SLOT_OPTIONS } from 'modules/dashboard-builder/hooks/useDashboardBuilderTemplateSlot.ts'
import { SlotOption, SlotOptionId, Slots, SlotType, TemplateSlotSelections } from 'modules/dashboard-builder/types'

interface TemplateSlotProps {
  children: ReactNode
  name: Slots
  options?: SlotOption[]
  selection: TemplateSlotSelections<Slots> | null
  size?: 'small' | 'medium' | 'large'
  type: SlotType
  onClear?: (key: Slots) => void
  onSelect?: (key: Slots, value: SlotOptionId) => void
  isReadOnly: boolean
}

export const TemplateSlot = ({ children, name, options, selection, size, type, isReadOnly, onClear, onSelect }: TemplateSlotProps) => {
  const title = (options ? options : DASHBOARD_BUILDER_SLOT_OPTIONS).find(({ id }) => id === selection?.[name])?.label ?? ''

  const filteredOptions = useMemo(
    () =>
      options
        ? options.filter((option) => {
            const isSelected = selection ? Object.values(selection).includes(option.id) : false

            return !isSelected && option.type === type
          })
        : [],
    [options, selection, type]
  )

  const isSelected = Boolean(selection?.[name])

  const handleClear = () => {
    onClear?.(name)
  }

  const handleSelect = (event: MouseEvent<HTMLLIElement>) => {
    onSelect?.(name, (event.currentTarget.id as SlotOptionId) ?? '')
  }

  if (isReadOnly) {
    return (
      <TemplateSlotContextProvider value={{ name, selection }}>
        <CardAnalytics size={size} title={title} onClear={handleClear} isReadOnly={isReadOnly}>
          {children}
        </CardAnalytics>
      </TemplateSlotContextProvider>
    )
  }

  return (
    <TemplateSlotContextProvider value={{ name, selection }}>
      {!isSelected ? (
        <CardSlot size={size} options={filteredOptions} onSelect={handleSelect} />
      ) : (
        <CardAnalytics size={size} title={title} onClear={handleClear}>
          {children}
        </CardAnalytics>
      )}
    </TemplateSlotContextProvider>
  )
}

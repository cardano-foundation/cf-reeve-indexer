import { useContext } from 'react'

import { TemplateSlotContext } from 'modules/dashboard-builder/components/TemplateSlotContext/TemplateSlotContext.component.tsx'

export const useTemplateSlotContext = () => {
  const context = useContext(TemplateSlotContext)

  if (!context) {
    throw new Error('useTemplateSlotContex must be used within a TemplateSlotContextProvider')
  }
  return context
}

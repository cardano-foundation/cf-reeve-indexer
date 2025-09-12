import { createContext, ReactNode } from 'react'

import { Slots, TemplateSlotSelections } from 'modules/dashboard-builder/types'

interface TemplateSlotContextProps {
  name: Slots
  selection: TemplateSlotSelections<Slots> | null
}

export const TemplateSlotContext = createContext<TemplateSlotContextProps | undefined>(undefined)

interface TemplateSlotContextProviderProps {
  children: ReactNode
  value: TemplateSlotContextProps
}

export const TemplateSlotContextProvider = ({ children, value }: TemplateSlotContextProviderProps) => {
  return <TemplateSlotContext.Provider value={value}>{children}</TemplateSlotContext.Provider>
}

import React from 'react'

import type { PublicEventsContextProps, PublicEventsContextProviderProps } from './PublicEventsContext.types'

export const PublicEventsContext = React.createContext<PublicEventsContextProps | undefined>(undefined)

export const PublicEventsContextProvider = ({ children, value }: PublicEventsContextProviderProps) => {
  return <PublicEventsContext.Provider value={value}>{children}</PublicEventsContext.Provider>
}

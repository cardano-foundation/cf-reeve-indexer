import React from 'react'

import { PublicReportsContextProps, PublicReportsContextProviderProps } from './PublicReportsContext.types'

export const PublicReportsContext = React.createContext<PublicReportsContextProps | undefined>(undefined)

export const PublicReportsContextProvider = ({ children, value }: PublicReportsContextProviderProps) => {
  return <PublicReportsContext.Provider value={value}>{children}</PublicReportsContext.Provider>
}

import React from 'react'

import type { PublicTransactionsContextProps, PublicTransactionsContextProviderProps } from './PublicTransactionsContext.types'

export const PublicTransactionsContext = React.createContext<PublicTransactionsContextProps | undefined>(undefined)

export const PublicTransactionsContextProvider = ({ children, value }: PublicTransactionsContextProviderProps) => {
  return <PublicTransactionsContext.Provider value={value}>{children}</PublicTransactionsContext.Provider>
}

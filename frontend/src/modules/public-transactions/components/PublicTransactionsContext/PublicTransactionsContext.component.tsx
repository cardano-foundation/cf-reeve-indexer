import React from 'react'

export const PublicTransactionsContext = React.createContext(undefined)

export const PublicTransactionsContextProvider = ({ children, value }) => {
  return <PublicTransactionsContext.Provider value={value}>{children}</PublicTransactionsContext.Provider>
}

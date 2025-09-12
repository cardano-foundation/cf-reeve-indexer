import { useContext } from 'react'

import { TransactionsContext } from 'modules/review/components/TransactionsContext/TransactionsContext.component.tsx'

export const useTransactionsContext = () => {
  const context = useContext(TransactionsContext)

  if (!context) {
    throw new Error('useTransactionsContext must be used within a BatchContextProvider')
  }
  return context
}

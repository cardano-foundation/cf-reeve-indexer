import { useContext } from 'react'

import { TransactionsReprocessContext } from 'modules/review/components/TransactionsReprocessContext/TransactionsReprocessContext.component.tsx'

export const useTransactionsReprocessContext = () => {
  const context = useContext(TransactionsReprocessContext)

  if (!context) {
    throw new Error('useTransactionsReprocessContext must be used within a TransactionsReprocessContextProvider')
  }
  return context
}

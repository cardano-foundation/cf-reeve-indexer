import { useContext } from 'react'

import { TransactionsPublishContext } from 'modules/publish/components/TransactionsPublishContext/TransactionsPublishContext.component.tsx'

export const useTransactionsPublishContext = () => {
  const context = useContext(TransactionsPublishContext)

  if (!context) {
    throw new Error('useTransactionsPublishContext must be used within a BatchContextProvider')
  }
  return context
}

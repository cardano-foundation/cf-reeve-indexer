import { useContext } from 'react'

import { PublicTransactionsContext } from 'modules/public-transactions/components/PublicTransactionsContext/PublicTransactionsContext.component'

export const usePublicTransactionsContext = () => {
  const context = useContext(PublicTransactionsContext)

  if (!context) {
    throw new Error('usePublicTransactionsContext must be used within a PublicTransactionsContextProvider')
  }

  return context
}

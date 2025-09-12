import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

import { TransactionItemsRejection } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

interface TransactionId {
  id: string
}

interface TransactionsContextProps {
  selectedTransactions: TransactionId[] | undefined
  setSelectedTransactions: Dispatch<SetStateAction<TransactionId[] | undefined>>
  transactionsRejectionReasons: TransactionItemsRejection[]
  setTransactionsRejectionReasons: Dispatch<SetStateAction<TransactionItemsRejection[]>>
}

export const TransactionsContext = createContext<TransactionsContextProps | undefined>(undefined)

export const TransactionsContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionId[]>()
  const [transactionsRejectionReasons, setTransactionsRejectionReasons] = useState<TransactionItemsRejection[]>([])

  return (
    <TransactionsContext.Provider value={{ selectedTransactions, setSelectedTransactions, transactionsRejectionReasons, setTransactionsRejectionReasons }}>
      {children}
    </TransactionsContext.Provider>
  )
}

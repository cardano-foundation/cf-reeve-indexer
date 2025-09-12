import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'

import { TransactionItemsRejection } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

interface TransactionId {
  id: string
}

interface TransactionsPublishContextProps {
  selectedTransactions: TransactionId[] | undefined
  setSelectedTransactions: Dispatch<SetStateAction<TransactionId[] | undefined>>
  transactionsRejectionReasons: TransactionItemsRejection[]
  setTransactionsRejectionReasons: Dispatch<SetStateAction<TransactionItemsRejection[]>>
}

export const TransactionsPublishContext = createContext<TransactionsPublishContextProps | undefined>(undefined)

export const TransactionsPublishContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTransactions, setSelectedTransactions] = useState<TransactionId[]>()
  const [transactionsRejectionReasons, setTransactionsRejectionReasons] = useState<TransactionItemsRejection[]>([])

  return (
    <TransactionsPublishContext.Provider value={{ selectedTransactions, setSelectedTransactions, transactionsRejectionReasons, setTransactionsRejectionReasons }}>
      {children}
    </TransactionsPublishContext.Provider>
  )
}

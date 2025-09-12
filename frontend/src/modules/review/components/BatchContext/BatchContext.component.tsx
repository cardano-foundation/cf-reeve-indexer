import { createContext, useState, ReactNode, useEffect } from 'react'

import { useLocationState } from 'hooks'
import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { PATHS } from 'routes'

interface BatchLocationState {
  batchId: string
  batchStat: BatchStatistics
  redirect?: string
}

interface BatchContextProps {
  redirect?: string
  selectedBatchId: string
  setSelectedBatchId: (value: string) => void
  selectedBatchStat: BatchStatistics | undefined
  setSelectedBatchStat: (value: BatchStatistics | undefined) => void
}

export const BatchContext = createContext<BatchContextProps | undefined>(undefined)

export const BatchContextProvider = ({ children }: { children: ReactNode }) => {
  const { pathname, state } = useLocationState<BatchLocationState>()

  const { batchId, batchStat, redirect } = state || {}

  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [selectedBatchStat, setSelectedBatchStat] = useState<BatchStatistics | undefined>(undefined)

  const isReview = pathname === PATHS.TRANSACTIONS_REVIEW

  useEffect(() => {
    if (isReview && batchId) {
      setSelectedBatchId(batchId)
    }

    if (isReview && batchStat) {
      setSelectedBatchStat(batchStat)
    }
  }, [batchId, batchStat, isReview])

  return <BatchContext.Provider value={{ redirect, selectedBatchId, setSelectedBatchId, selectedBatchStat, setSelectedBatchStat }}>{children}</BatchContext.Provider>
}

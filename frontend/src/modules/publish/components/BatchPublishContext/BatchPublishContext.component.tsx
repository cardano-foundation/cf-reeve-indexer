import { createContext, ReactNode, useEffect, useState } from 'react'

import { useLocationState } from 'hooks'
import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { PATHS } from 'routes'

interface BatchPublishLocationState {
  batchId: string
  batchStat: BatchStatistics
  redirect?: string
}

interface BatchPublishContextProps {
  redirect?: string
  selectedBatchId: string
  setSelectedBatchId: (value: string) => void
  selectedBatchStat: BatchStatistics | undefined
  setSelectedBatchStat: (value: BatchStatistics | undefined) => void
}

export const BatchPublishContext = createContext<BatchPublishContextProps | undefined>(undefined)

export const BatchPublishContextProvider = ({ children }: { children: ReactNode }) => {
  const { pathname, state } = useLocationState<BatchPublishLocationState>()

  const { batchId, batchStat, redirect } = state || {}

  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [selectedBatchStat, setSelectedBatchStat] = useState<BatchStatistics>()

  const isPublish = pathname === PATHS.TRANSACTIONS_PUBLISH

  useEffect(() => {
    if (isPublish && batchId) {
      setSelectedBatchId(batchId)
    }

    if (isPublish && batchStat) {
      setSelectedBatchStat(batchStat)
    }
  }, [batchId, batchStat, isPublish])

  return <BatchPublishContext.Provider value={{ redirect, selectedBatchId, setSelectedBatchId, selectedBatchStat, setSelectedBatchStat }}>{children}</BatchPublishContext.Provider>
}

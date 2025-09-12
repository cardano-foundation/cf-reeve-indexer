import { useContext } from 'react'

import { BatchContext } from 'modules/review/components/BatchContext/BatchContext.component.tsx'

export const useBatchContext = () => {
  const context = useContext(BatchContext)

  if (!context) {
    throw new Error('useBatchContext must be used within a BatchContextProvider')
  }
  return context
}

import { useContext } from 'react'

import { BatchDetailsContext } from 'modules/review/components/BatchDetailsContext/BatchDetailsContext.component.tsx'

export const useBatchDetailsContext = () => {
  const context = useContext(BatchDetailsContext)

  if (!context) {
    throw new Error('useBatchDetailsContext must be used within a BatchDetailsContextProvider')
  }
  return context
}

import { useContext } from 'react'

import { BatchPublishContext } from 'modules/publish/components/BatchPublishContext/BatchPublishContext.component.tsx'

export const useBatchPublishContext = () => {
  const context = useContext(BatchPublishContext)

  if (!context) {
    throw new Error('useBatchContext must be used within a BatchContextProvider')
  }
  return context
}

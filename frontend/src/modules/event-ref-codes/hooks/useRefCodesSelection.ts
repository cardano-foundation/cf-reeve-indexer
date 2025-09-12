import { useState } from 'react'

import { RefCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'

interface RefCodeSelectionState {
  refCodes: RefCodeResponse[]
}

export const useRefCodesSelection = (state: RefCodeSelectionState) => {
  const { refCodes } = state

  const [refCodeId, setRefCodeId] = useState<string | null>(null)

  const handleRefCodeSelection = (id: string) => {
    setRefCodeId(id)
  }

  const handleRefCodeSelectionReset = () => {
    setRefCodeId(null)
  }

  const refCode = refCodes?.find(({ referenceCode }) => referenceCode === refCodeId)

  return {
    refCode,
    handleRefCodeSelection,
    handleRefCodeSelectionReset
  }
}

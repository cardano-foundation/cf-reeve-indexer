import { useState } from 'react'

import { GetVatCodesResponse200 } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'

interface VatCodesSelectionState {
  vatCodes: GetVatCodesResponse200
}

export const useVatCodesSelection = (state: VatCodesSelectionState) => {
  const { vatCodes } = state

  const [vatCodeId, setVatCodeId] = useState<string | null>(null)

  const handleVatCodeSelection = (code: string) => {
    setVatCodeId(code)
  }

  const handleVatCodeSelectionReset = () => {
    setVatCodeId(null)
  }

  const vatCode = vatCodes?.find(({ customerCode }) => customerCode === vatCodeId)

  return {
    vatCode,
    handleVatCodeSelection,
    handleVatCodeSelectionReset
  }
}

import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { VatCodeRequestParameters } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'

const createVatCodeQuery = async (payload: Partial<VatCodeRequestParameters>) => {
  const { vatCodesApi } = backendLobApi()

  const data = await vatCodesApi.createVatCode(payload)

  if (!data) return null

  return data
}

export const useCreateVatCodeModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['CREATE_VAT_CODE'], mutationFn: createVatCodeQuery })

  return {
    createdVatCode: data ?? null,
    triggerCreateVatCode: mutateAsync
  }
}

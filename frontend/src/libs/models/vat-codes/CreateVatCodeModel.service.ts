import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { VatCodeRequestParameters } from 'libs/api-connectors/backend-connector-reeve/api/vat-codes/vatCodesApi.types.ts'

const createVatCodeQuery = async (payload: Partial<VatCodeRequestParameters>) => {
  const { vatCodesApi } = backendReeveApi()

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

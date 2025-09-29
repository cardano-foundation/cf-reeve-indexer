import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { VatCodeRequestParameters } from 'libs/api-connectors/backend-connector-reeve/api/vat-codes/vatCodesApi.types.ts'

const updateVatCodeQuery = async (payload: Partial<VatCodeRequestParameters>) => {
  const { vatCodesApi } = backendReeveApi()

  const data = await vatCodesApi.updateVatCode(payload)

  if (!data) return null

  return data
}

export const useUpdateVatCodeModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPDATE_VAT_CODE'], mutationFn: updateVatCodeQuery })

  return {
    updatedVatCode: data ?? null,
    triggerUpdateVatCode: mutateAsync
  }
}

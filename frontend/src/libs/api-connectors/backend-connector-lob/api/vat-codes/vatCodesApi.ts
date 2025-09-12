import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  GetVatCodesResponse200,
  UploadVatCodesRequest,
  UploadVatCodesResponse200,
  VatCodeRequestParameters,
  VatCodeResponse
} from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { Headers, MediaTypes } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'

export const vatCodesApi = (baseUrl: string) => {
  const { get, post, put } = httpService(baseUrl)

  const getVatCodes = (organisationId: string) => {
    return get<GetVatCodesResponse200>(`api/v1/organisations/${organisationId}/vat-codes`)
  }

  const createVatCode = (parameters: Partial<VatCodeRequestParameters>) => {
    const { organisationId, ...payload } = parameters

    return post<VatCodeResponse, Partial<VatCodeRequestParameters>>(`api/v1/organisations/${organisationId}/vat-codes`, payload)
  }

  const updateVatCode = (parameters: Partial<VatCodeRequestParameters>) => {
    const { organisationId, ...payload } = parameters

    return put<VatCodeResponse, Partial<VatCodeRequestParameters>>(`api/v1/organisations/${organisationId}/vat-codes`, payload)
  }

  const uploadVatCodes = (payload: UploadVatCodesRequest) => {
    const {
      parameters: { organisationId },
      body
    } = payload

    return post<UploadVatCodesResponse200, FormData>(`api/v1/organisations/${organisationId}/vat-codes`, body, { [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA })
  }

  return {
    getVatCodes,
    createVatCode,
    updateVatCode,
    uploadVatCodes
  }
}

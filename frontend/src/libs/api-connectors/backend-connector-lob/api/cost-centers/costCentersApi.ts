import {
  CostCenterRequestParameters,
  CostCenterResponse,
  GetCostCentersResponse200,
  UploadCostCentersResponse200,
  UploadCostCentersRequest
} from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import { Headers, MediaTypes } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'

export const costCenterApi = (baseUrl: string) => {
  const { post, get, put } = httpService(baseUrl)

  const getCostCenters = (organisationId: string) => {
    return get<GetCostCentersResponse200>(`api/v1/organisations/${organisationId}/cost-centers`)
  }

  const createCostCenter = (parameters: Partial<CostCenterRequestParameters>) => {
    const { organisationId, ...payload } = parameters

    return post<CostCenterResponse, Partial<CostCenterRequestParameters>>(`api/v1/organisations/${organisationId}/cost-centers`, payload)
  }

  const updateCostCenter = (parameters: Partial<CostCenterRequestParameters>) => {
    const { organisationId, ...payload } = parameters

    return put<CostCenterResponse, Partial<CostCenterRequestParameters>>(`api/v1/organisations/${organisationId}/cost-centers`, payload)
  }

  const uploadCostCenters = (payload: UploadCostCentersRequest) => {
    const {
      parameters: { organisationId },
      body
    } = payload

    return post<UploadCostCentersResponse200, FormData>(`api/v1/organisations/${organisationId}/cost-centers`, body, { [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA })
  }

  return {
    getCostCenters,
    createCostCenter,
    updateCostCenter,
    uploadCostCenters
  }
}

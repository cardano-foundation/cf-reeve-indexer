import { ApiError } from 'libs/api-connectors/backend-connector-lob/api/errors.types.ts'

export interface CostCenterResponse {
  customerCode: string
  name: string
  parent?: CostCenterResponse
  error: ApiError | null
  active: boolean
}

export type GetCostCentersResponse200 = CostCenterResponse[]

export interface CostCenterRequestParameters {
  organisationId: string
  customerCode: string
  name: string
  parentCustomerCode: string
  active: boolean
}

export interface UploadCostCentersRequestParameters {
  organisationId: string
}

export interface UploadCostCentersRequest {
  parameters: UploadCostCentersRequestParameters
  body: FormData
}

export type UploadCostCentersResponse200 = CostCenterResponse[]

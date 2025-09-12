import { ApiError } from 'libs/api-connectors/backend-connector-lob/api/errors.types.ts'

export type RefCodeResponse = {
  referenceCode: string
  description: string
  parent?: RefCodeResponse
  error: ApiError | null
  active: boolean
}

// GET
export type GetRefCodesResponse200 = RefCodeResponse[]

// POST
export type PostRefCodeRequest = { organisationId: string; referenceCode: string; name: string; parentReferenceCode?: string; active: boolean }

export type PostRefCodeResponse200 = RefCodeResponse

export interface UploadRefCodesRequestParameters {
  organisationId: string
}

export interface UploadRefCodesRequest {
  parameters: UploadRefCodesRequestParameters
  body: FormData
}

export type UploadRefCodeResponse200 = RefCodeResponse[]

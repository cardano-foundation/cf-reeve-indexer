import { ApiError } from 'libs/api-connectors/backend-connector-lob/api/errors.types.ts'

export interface EventCodeResponse {
  organisationId: string
  debitReferenceCode: string
  creditReferenceCode: string
  customerCode: string
  description: string
  error: ApiError | null
  active?: boolean
}

// GET
export type GetEventCodesResponse200 = EventCodeResponse[]

// POST
export type PostEventCode = {
  organisationId: string
  debitReferenceCode: string
  creditReferenceCode: string
  name: string
  active?: boolean
  parentReferenceCode?: string
}

export type PostEventCodeRequest = PostEventCode

export type PostEventCodeResponse200 = EventCodeResponse

export interface UploadEventCodesRequestParameters {
  organisationId: string
}

export interface UploadEventCodesRequest {
  parameters: UploadEventCodesRequestParameters
  body: FormData
}

export type UploadEventCodesResponse200 = EventCodeResponse[]

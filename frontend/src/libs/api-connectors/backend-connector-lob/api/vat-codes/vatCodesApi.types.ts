import { ApiError } from 'libs/api-connectors/backend-connector-lob/api/errors.types.ts'

export interface VatCodeResponse {
  organisationId: string
  countryCode: string
  customerCode: string
  description: string
  error: ApiError | null
  rate: string
  active: boolean
}

export type GetVatCodesResponse200 = VatCodeResponse[]

export interface VatCodeRequestParameters {
  organisationId: string
  countryCode?: string
  customerCode: string
  description: string
  rate: number
  active: boolean
}

export interface UploadVatCodesRequestParameters {
  organisationId: string
}

export interface UploadVatCodesRequest {
  parameters: UploadVatCodesRequestParameters
  body: FormData
}

export type UploadVatCodesResponse200 = VatCodeResponse[]

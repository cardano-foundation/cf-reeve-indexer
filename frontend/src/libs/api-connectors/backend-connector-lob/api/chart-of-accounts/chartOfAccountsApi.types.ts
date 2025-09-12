import { ApiError } from 'libs/api-connectors/backend-connector-lob/api/errors.types.ts'

export interface ChartOfAccount {
  customerCode: string
  eventRefCode: string
  name: string
  currency: string
  counterParty: string
  type: number
  subType: number
  parentCustomerCode: string | null
  openingBalance: {
    balanceFCY: number
    balanceLCY: number
    originalCurrencyIdFCY: string
    originalCurrencyIdLCY: string
    balanceType: string
    date: string
  } | null
  error: ApiError | null
  active: boolean
}

export type GetChartOfAccountResponse200 = ChartOfAccount[]

export interface PostChartOfAccountRequest extends ChartOfAccount {
  organisationId: string
}

export interface UploadChartOfAccountsRequestParameters {
  organisationId: string
}

export interface UploadChartOfAccountsRequest {
  parameters: UploadChartOfAccountsRequestParameters
  body: FormData
}

export type UploadChartOfAccountsResponse200 = ChartOfAccount[]

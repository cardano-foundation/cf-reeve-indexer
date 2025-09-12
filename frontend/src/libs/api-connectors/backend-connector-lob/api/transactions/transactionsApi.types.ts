import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'

export interface ApiError {
  detail: string
  status?: number
  title: string
}

export enum ExtractorType {
  CSV = 'CSV',
  NETSUITE = 'NETSUITE'
}

export interface TransactionType {
  id: string
  title: string
}

export interface TransactionsTypesApiResponse extends Array<TransactionType> {}

export interface ExtractTransactionsApiResponse {
  event: string
  message: string
}

export interface ExtractTransactionsApiRequest {
  organisationId: string
  extractorType: ExtractorType.NETSUITE
  dateFrom: string
  dateTo: string
  transactionType?: string[]
  transactionNumbers?: string[]
}

export interface UploadTransactionsApiResponse {
  event: string
  message: string
}

export interface UploadTransactionsApiError {
  valid: boolean
  errors: ApiError[]
}

export interface UploadTransactionsApiRequest {
  organisationId: string
  extractorType: ExtractorType.CSV
  dateFrom: string
  dateTo: string
  file: File
}

export interface ApproveTransactionsApiRequest {
  organisationId: string
  transactionIds: { id: string }[]
}

export interface ApproveTransactionResponse {
  id: string
  success: boolean
  error: {
    title: string
    status: {
      reasonPhrase: string
      statusCode: number
    }
    detail: string
    instance: string
    type: string
    parameters: never
  }
}

export interface ApproveTransactionsApiResponse extends Array<ApproveTransactionResponse> {}

export enum TransactionsRejectionReasons {
  INCORRECT_AMOUNT = 'INCORRECT_AMOUNT',
  INCORRECT_COST_CENTER = 'INCORRECT_COST_CENTER',
  INCORRECT_PROJECT = 'INCORRECT_PROJECT',
  INCORRECT_CURRENCY = 'INCORRECT_CURRENCY',
  INCORRECT_VAT_CODE = 'INCORRECT_VAT_CODE',
  REVIEW_PARENT_COST_CENTER = 'REVIEW_PARENT_COST_CENTER',
  REVIEW_PARENT_PROJECT_CODE = 'REVIEW_PARENT_PROJECT_CODE'
}

export interface TransactionsRejectionReasonsApiResponse extends Array<TransactionsRejectionReasons> {}

export interface TransactionItemsRejection {
  txItemId: string
  rejectionCode: TransactionsRejectionReasons
}

export interface RejectTransactionsApiRequest {
  organisationId: string
  transactionId: string
  transactionItemsRejections: TransactionItemsRejection[]
}

export interface RejectTransactionItemResponse {
  transactionItemId: string
  success: boolean
  error: {
    title: string
    status: {
      reasonPhrase: string
      statusCode: number
    }
    detail: string
    instance: string
    type: string
    parameters: never
  }
}

export interface RejectTransactionsApiResponse {
  transactionId: string
  success: boolean
  statistic: BatchStatistics
  error: {
    title: string
    status: {
      reasonPhrase: string
      statusCode: number
    }
    detail: string
    instance: string
    type: string
    parameters: never
  }
  items: RejectTransactionItemResponse[]
}

export interface PublishTransactionsApiRequest {
  organisationId: string
  transactionIds: { id: string }[]
}

export interface PublishTransactionResponse {
  id: string
  success: boolean
  error: {
    title: string
    status: {
      reasonPhrase: string
      statusCode: number
    }
    detail: string
    instance: string
    type: string
    parameters: never
  }
}

export interface PublishTransactionsApiResponse extends Array<PublishTransactionResponse> {}

export enum FilterType {
  DOCUMENT_NUMBERS = 'DOCUMENT_NUMBERS',
  TRANSACTION_TYPES = 'TRANSACTION_TYPES',
  COUNTER_PARTY_TYPE = 'COUNTER_PARTY_TYPE',
  COUNTER_PARTY = 'COUNTER_PARTY',
  USERS = 'USERS'
}

export interface GetFilterOptionsRequestParameters {
  organisationId: string
  filterOptions: FilterType[]
}

export interface GetFilterOptionsRequest {
  parameters: GetFilterOptionsRequestParameters
}

type FilterOptionsResponse = Record<FilterType, string[]>

export interface GetFilterOptionsResponse {
  filterOptions: FilterOptionsResponse
}

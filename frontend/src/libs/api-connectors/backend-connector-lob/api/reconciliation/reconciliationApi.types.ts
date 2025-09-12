import { TransactionApiResponse } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'

export interface TriggerReconciliationApiRequest {
  organisationId: string
  dateFrom: string
  dateTo: string
}

export interface TriggerReconciliationApiResponse {
  message: string
  event: string
  success: boolean
  dateFrom: string
  dateTo: string
  error?: {
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

export enum ReconciliationFilter {
  RECONCILED = 'RECONCILED',
  UNRECONCILED = 'UNRECONCILED',
  UNPROCESSED = 'UNPROCESSED'
}

export enum ReconciliationRejectionCode {
  MISSING_IN_ERP = 'MISSING_IN_ERP',
  IN_PROCESSING = 'IN_PROCESSING',
  NEW_IN_ERP = 'NEW_IN_ERP',
  NEW_VERSION_NOT_PUBLISHED = 'NEW_VERSION_NOT_PUBLISHED',
  NEW_VERSION = 'NEW_VERSION'
}

export interface GetReconciledTransactionsApiRequest {
  organisationId: string
  filter: ReconciliationFilter
  reconciliationRejectionCode?: ReconciliationRejectionCode[]
}

export interface GetReconciledTransactionsApiParameters {
  page: number
  size: number
}

export enum ReconciliationStatus {
  OK = 'OK',
  NOT_OK = 'NOK',
  NEVER = 'NEVER'
}

export interface TransactionReconcileApiResponse extends TransactionApiResponse {
  reconciliationSource: ReconciliationStatus
  reconciliationSink: ReconciliationStatus
  reconciliationFinalStatus: ReconciliationStatus
  reconciliationRejectionCode: ReconciliationRejectionCode[]
  reconciliationDate: string
  dataSource?: string
}

export interface GetReconciledTransactionsApiResponse {
  total: number
  statistic: {
    ok: number
    nok: number
    never: number
    total: number
    missingInERP: number
    inProcessing: number
    newInERP: number
    newVersionNotPublished: number
    newVersion: number
  }
  transactions: TransactionReconcileApiResponse[]
}

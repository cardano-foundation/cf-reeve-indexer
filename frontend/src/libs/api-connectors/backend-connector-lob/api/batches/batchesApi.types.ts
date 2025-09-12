import { Dayjs } from 'dayjs'

import { TransactionsRejectionReasons } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

export type BatchStatisticsApiResponse = {
  approve: number
  pending: number
  invalid: number
  publish: number
  published: number
  total: number
}

export enum BatchStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  COMPLETE = 'COMPLETE',
  FINALIZED = 'FINALIZED',
  FAILED = 'FAILED'
}

export enum BatchBlockchainStatus {
  NOT_DISPATCHED = 'NOT_DISPATCHED',
  MARK_DISPATCH = 'MARK_DISPATCH',
  DISPATCHED = 'DISPATCHED',
  COMPLETE = 'COMPLETE',
  FINALIZED = 'FINALIZED',
  FAILED = 'FAILED'
}

export enum CounterpartyType {
  EMPLOYEE = 'EMPLOYEE',
  VENDOR = 'VENDOR',
  DONOR = 'DONOR',
  CLIENT = 'CLIENT'
}

export interface TransactionItemApiResponse {
  id: string
  accountDebitCode: string
  accountDebitName: string
  accountDebitRefCode: string
  accountCreditCode: string
  accountCreditName: string
  accountCreditRefCode: string
  amountFcy: number
  amountLcy: number
  fxRate: number
  costCenterCustomerCode: string
  costCenterExternalCustomerCode: string
  costCenterName: string
  projectCustomerCode: string
  projectName: string
  projectExternalCustomerCode: string
  accountEventCode: string
  accountEventName: string
  documentNum: string
  documentCurrencyCustomerCode: string
  vatCustomerCode: string
  vatRate: number
  counterpartyCustomerCode: string
  counterpartyType: CounterpartyType
  counterpartyName: string
  rejectionReason?: TransactionsRejectionReasons
}

export enum TransactionType {
  CARD_CHARGE = 'CardCharge',
  VENDOR_BILL = 'VendorBill',
  CARD_REFUND = 'CardRefund',
  JOURNAL = 'Journal',
  FX_REVALUATION = 'FxRevaluation',
  TRANSFER = 'Transfer',
  CUSTOMER_PAYMENT = 'CustomerPayment',
  EXPENSE_REPORT = 'ExpenseReport',
  VENDOR_PAYMENT = 'VendorPayment',
  BILL_CREDIT = 'BillCredit'
}

export enum ValidationStatus {
  VALIDATED = 'VALIDATED',
  FAILED = 'FAILED'
}

export enum Status {
  FAIL = 'FAIL',
  OK = 'OK'
}

export enum ViolationCode {
  DOCUMENT_MUST_BE_PRESENT = 'DOCUMENT_MUST_BE_PRESENT',
  TX_CANNOT_BE_ALTERED = 'TX_CANNOT_BE_ALTERED',
  ACCOUNT_CODE_CREDIT_IS_EMPTY = 'ACCOUNT_CODE_CREDIT_IS_EMPTY',
  ACCOUNT_CODE_DEBIT_IS_EMPTY = 'ACCOUNT_CODE_DEBIT_IS_EMPTY',
  TX_VALIDATION_ERROR = 'TX_VALIDATION_ERROR',
  LCY_BALANCE_MUST_BE_ZERO = 'LCY_BALANCE_MUST_BE_ZERO',
  FCY_BALANCE_MUST_BE_ZERO = 'FCY_BALANCE_MUST_BE_ZERO',
  AMOUNT_LCY_IS_ZERO = 'AMOUNT_LCY_IS_ZERO',
  AMOUNT_FCY_IS_ZERO = 'AMOUNT_FCY_IS_ZERO',
  TRANSACTION_ITEMS_EMPTY = 'TRANSACTION_ITEMS_EMPTY',
  VAT_DATA_NOT_FOUND = 'VAT_DATA_NOT_FOUND',
  CORE_CURRENCY_NOT_FOUND = 'CORE_CURRENCY_NOT_FOUND',
  CURRENCY_DATA_NOT_FOUND = 'CURRENCY_DATA_NOT_FOUND',
  COST_CENTER_DATA_NOT_FOUND = 'COST_CENTER_DATA_NOT_FOUND',
  PROJECT_DATA_NOT_FOUND = 'PROJECT_DATA_NOT_FOUND',
  CHART_OF_ACCOUNT_NOT_FOUND = 'CHART_OF_ACCOUNT_NOT_FOUND',
  EVENT_DATA_NOT_FOUND = 'EVENT_DATA_NOT_FOUND',
  ORGANISATION_DATA_NOT_FOUND = 'ORGANISATION_DATA_NOT_FOUND',
  JOURNAL_DUMMY_ACCOUNT_MISSING = 'JOURNAL_DUMMY_ACCOUNT_MISSING',
  TX_VERSION_CONFLICT_TX_NOT_MODIFIABLE = 'TX_VERSION_CONFLICT_TX_NOT_MODIFIABLE'
}

export enum ViolationSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARN'
}

export enum ViolationSource {
  ERP = 'ERP',
  LOB = 'LOB'
}

export interface Violation {
  severity: ViolationSeverity
  source: ViolationSource
  transactionItemId: string
  code: ViolationCode
  bag: Record<string, string | number>
}

export interface TransactionApiResponse {
  id: string
  internalTransactionNumber: string
  entryDate: string
  transactionType: TransactionType
  validationStatus: ValidationStatus
  violations: Violation[]
  transactionApproved: boolean
  ledgerDispatchApproved: boolean
  amountTotalLcy: number
  ledgerDispatchStatus: BatchBlockchainStatus
  status: Status
  statistic: BatchStatistics
  items: TransactionItemApiResponse[]
  itemRejection: boolean
}

export interface BatchApiResponse {
  id: string
  createdAt: string
  createdBy: string
  updatedAt: string
  organisationId: string
  status: BatchStatus
  batchStatistics: BatchStatisticsApiResponse
  transactions: TransactionApiResponse[]
}

export interface BatchReprocessErrorStatus {
  reasonPhrase: string
  statusCode: number
}

export type BatchReprocessErrorParameters = Record<string, Record<string, string | number>>

export interface BatchReprocessError {
  detail: string
  instance: string
  status: BatchReprocessErrorStatus
  title: string
  type: string
  parameters: BatchReprocessErrorParameters
}

export interface BatchReprocessApiResponse {
  batchId: string
  success: boolean
  error: BatchReprocessError | null
}

export interface BatchesApiResponse {
  total: number
  batchs: BatchApiResponse[]
}

export enum BatchStatistics {
  APPROVE = 'APPROVE',
  PENDING = 'PENDING',
  INVALID = 'INVALID',
  PUBLISH = 'PUBLISH',
  PUBLISHED = 'PUBLISHED'
}

export interface BatchesApiRequest {
  organisationId: string
  batchStatistics?: BatchStatistics[]
  transactionTypes?: string[]
  from?: string
  to?: string
}

export interface BatchesApiParameters {
  page: number
  size: number
}

export interface BatchApiParameters {
  batchId: string
  status?: BatchStatistics[]
  page?: number
  size?: number
}

export interface PostBatchDetailsRequestParameters {
  batchId: string
  page: number
  size: number
  sort: string[]
  status: BatchStatistics[]
}

export interface PostBatchDetailsRequestBody {
  dateFrom?: Dayjs | null
  dateTo?: Dayjs | null
  transactionTypes?: string[]
  documentNumbers?: string[]
  currencyCustomerCodes?: string[]
  minFCY?: number
  maxFCY?: number
  minLCY?: number
  maxLCY?: number
  minTotalLcy?: number
  maxTotalLcy?: number
  vatCustomerCodes?: string[]
  parentCostCenterCustomerCodes?: string[]
  costCenterCustomerCodes?: string[]
  counterPartyCustomerCodes?: string[]
  counterPartyTypes?: string[]
  debitAccountCodes?: string[]
  creditAccountCodes?: string[]
  eventCodes?: string[]
}

export interface PostBatchDetailsRequest {
  body?: PostBatchDetailsRequestBody
  parameters: PostBatchDetailsRequestParameters
}

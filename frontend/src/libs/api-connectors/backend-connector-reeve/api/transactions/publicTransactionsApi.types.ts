export interface PostPublicTransactionResponse {
  id: string
  transactionInternalNumber: string
  transactionID: string
  entryDate: string
  transactionType: string
  blockChainHash: string
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
  counterpartyType: string
  counterpartyName: string
}

export interface PostPublicTransactionsRequestParameters {
  page: number
  size: number
  sort: string[]
}

export interface PostPublicTransactionsRequestBody {
  organisationId: string
  transactionHashes?: string[]
  dateFrom?: string
  dateTo?: string
  transactionInternalNumber?: string[]
  type?: string[]
  documentNumber?: string[]
  currency?: string[]
  minAmount?: number
  maxAmount?: number
  vatCustCode?: string[]
  projectCustCode?: string[]
  costCenterCustCode?: string[]
  counterPartyCustCode?: string[]
  counterPartyType?: string[]
  events?: string[]
}

export interface PostPublicTransactionsRequest {
  body: PostPublicTransactionsRequestBody
  parameters: PostPublicTransactionsRequestParameters
}

export interface PostPublicTransactionsResponse200 {
  success: boolean
  total: number
  transactions?: PostPublicTransactionResponse[]
  error: null
}

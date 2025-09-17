export interface PublicTransactionResponse {
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

export interface GetPublicTransactionsRequest {
  organisationId: string
  dateFrom?: string
  dateTo?: string
  currency?: string[]
  events?: string[]
  maxAmount?: number
  minAmount?: number
  transactionHashes?: string[]
}

export interface GetPublicTransactionsParameters {
  page: number
  size: number
}

export interface GetPublicTransactionsResponse200 {
  success: boolean
  total: number
  transactions: PublicTransactionResponse[]
  error: null
}

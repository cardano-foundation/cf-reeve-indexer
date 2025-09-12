export interface ExtractedTransactionsResponse {
  id: string
  transactionInternalNumber: string
  transactionID: string
  entryDate: string
  transactionType: string
  blockChainHash: string
  reconciliation: string
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
  costCenterName: string
  projectCustomerCode: string
  projectName: string
  accountEventCode: string
  accountEventName: string
  documentNum: string
  documentCurrencyCustomerCode: string
  vatCustomerCode: string
  vatRate: number
  counterpartyCustomerCode: string
  counterpartyType: string
  counterpartyName: string
  rejectionReason: string
  parentCostCenterCustomerCode: string
  parentCostCenterName: string
  parentProjectCustomerCode: string
  parentProjectName: string
}

export interface GetExtractedTransactionsRequest {
  organisationId: string
  dateFrom?: string
  dateTo?: string
  costCenter?: string[]
  project?: string[]
  accountType?: string[]
  accountSubtype?: string[]
  accountCode?: string[]
}

export interface GetExtractedTransactionsResponse200 {
  success: boolean
  total: number
  transactions: ExtractedTransactionsResponse[]
  error: null
}

import dayjs from 'dayjs'

import { PostPublicTransactionsRequestBody } from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi.types.ts'
import { SearchFiltersValues } from 'modules/public-transactions/components/SearchFilters/SearchFilters.types.ts'
import { SearchQuickFiltersValues } from 'modules/public-transactions/components/SearchToolbar/SearchToolbar.types.ts'

export const mapSearchFiltersToRequestBody = (values: SearchFiltersValues & SearchQuickFiltersValues): Omit<PostPublicTransactionsRequestBody, 'organisationId'> => ({
  transactionHashes: values.search ? [values.search] : undefined,
  dateFrom: dayjs(values.dateFrom).isValid() ? dayjs(values.dateFrom).format('YYYY-MM-DD') : undefined,
  dateTo: dayjs(values.dateTo).isValid() ? dayjs(values.dateTo).format('YYYY-MM-DD') : undefined,
  transactionInternalNumber: values.transactionNumber.length ? values.transactionNumber : undefined,
  type: values.transactionType.length ? values.transactionType : undefined,
  documentNumber: values.documentNumber.length ? values.documentNumber : undefined,
  currency: values.currency.length ? values.currency : undefined,
  minAmount: values.minAmount ? parseFloat(values.minAmount.replace(/,/g, '')) : undefined,
  maxAmount: values.maxAmount ? parseFloat(values.maxAmount.replace(/,/g, '')) : undefined,
  vatCustCode: values.vatCode.length ? values.vatCode : undefined,
  projectCustCode: values.project.length ? values.project : undefined,
  costCenterCustCode: values.costCenter.length ? values.costCenter : undefined,
  counterPartyCustCode: values.counterparty.length ? values.counterparty : undefined,
  counterPartyType: values.counterpartyType.length ? values.counterpartyType : undefined,
  events: values.event.length ? values.event : undefined
})

export const mapSearchSortToRequestParameters = (sortBy: string, sortOrder: 'asc' | 'desc' | null | undefined) => {
  const sortMapping: Record<string, string> = {
    blockChainHash: 'blockChainHash',
    transactionInternalNumber: 'transactionInternalNumber',
    entryDate: 'entryDate',
    transactionType: 'transactionType',
    documentNumber: 'documentNumber',
    documentCurrencyCustomerCode: 'documentCurrencyCustomerCode',
    amountFcy: 'amountFcy',
    amountLcy: 'amountLcy',
    fxRate: 'fxRate',
    vatRate: 'vatRate',
    vatCustomerCode: 'vatCustomerCode',
    costCenter: 'costCenterCustCode',
    project: 'projectCustCode',
    counterpartyCustomerCode: 'counterPartyCustCode',
    counterpartyType: 'counterPartyType',
    accountEvent: 'eventCode'
  }

  return Array.isArray(sortMapping[sortBy]) ? sortMapping[sortBy].map((param) => `${param},${sortOrder}`) : [`${sortMapping[sortBy]},${sortOrder}`]
}

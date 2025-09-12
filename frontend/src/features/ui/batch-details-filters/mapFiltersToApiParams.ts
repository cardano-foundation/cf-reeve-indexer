import dayjs, { Dayjs } from 'dayjs'

import type { PostBatchDetailsRequestBody } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'

import type { BatchDetailsFiltersValues } from './batch-details-filters.types'

export const mapFiltersToApiParams = (values: Partial<BatchDetailsFiltersValues>): Partial<PostBatchDetailsRequestBody> => {
  const payload: Partial<PostBatchDetailsRequestBody> = {}

  // Arrays: only include if non-empty
  if (values.transactionType?.length) payload.transactionTypes = values.transactionType
  if (values.documentNumbers?.length) payload.documentNumbers = values.documentNumbers
  if (values.currency?.length) payload.currencyCustomerCodes = values.currency
  if (values.vatCode?.length) payload.vatCustomerCodes = values.vatCode
  if (values.costCenterParent?.length) payload.parentCostCenterCustomerCodes = values.costCenterParent
  if (values.costCenterChild?.length) payload.costCenterCustomerCodes = values.costCenterChild
  if (values.counterparty?.length) payload.counterPartyCustomerCodes = values.counterparty
  if (values.counterpartyType?.length) payload.counterPartyTypes = values.counterpartyType
  if (values.accountDebit?.length) payload.debitAccountCodes = values.accountDebit
  if (values.accountCredit?.length) payload.creditAccountCodes = values.accountCredit
  if (values.event?.length) payload.eventCodes = values.event

  // Numbers: only include if non-empty and numeric
  if (values.minAmountFCY) payload.minFCY = Number(values.minAmountFCY)
  if (values.maxAmountFCY) payload.maxFCY = Number(values.maxAmountFCY)
  if (values.minAmountLCY) payload.minLCY = Number(values.minAmountLCY)
  if (values.maxAmountLCY) payload.maxLCY = Number(values.maxAmountLCY)
  if (values.minTotalAmountLCY) payload.minTotalLcy = Number(values.minTotalAmountLCY)
  if (values.maxTotalAmountLCY) payload.maxTotalLcy = Number(values.maxTotalAmountLCY)

  // Dates: format if present
  if (values.dateFrom) {
    const df = dayjs(values.dateFrom as string | Date | Dayjs)
    if (df.isValid()) payload.dateFrom = df.format('YYYY-MM-DD')
  }
  if (values.dateTo) {
    const dt = dayjs(values.dateTo as string | Date | Dayjs)
    if (dt.isValid()) payload.dateTo = dt.format('YYYY-MM-DD')
  }

  return payload
}

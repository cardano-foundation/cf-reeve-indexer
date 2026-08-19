import dayjs from 'dayjs'

import { PostPublicEventsRequestBody } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types.ts'
import { SearchFiltersValues } from 'modules/public-events/components/SearchFilters/SearchFilters.types.ts'
import { SearchQuickFiltersValues } from 'modules/public-events/components/SearchToolbar/SearchToolbar.types.ts'

export const mapSearchFiltersToRequestBody = (values: SearchFiltersValues & SearchQuickFiltersValues): Omit<PostPublicEventsRequestBody, 'organisationId'> => ({
  search: values.search ? values.search : undefined,
  dateFrom: dayjs(values.dateFrom).isValid() ? dayjs(values.dateFrom).format('YYYY-MM-DD') : undefined,
  dateTo: dayjs(values.dateTo).isValid() ? dayjs(values.dateTo).format('YYYY-MM-DD') : undefined,
  eventTypes: values.eventType.length ? values.eventType : undefined,
  projectIds: values.project.length ? values.project : undefined,
  minAmount: values.minAmount ? parseFloat(values.minAmount.replace(/,/g, '')) : undefined,
  maxAmount: values.maxAmount ? parseFloat(values.maxAmount.replace(/,/g, '')) : undefined
})

export const mapSearchSortToRequestParameters = (sortBy: string, sortOrder: 'asc' | 'desc' | null | undefined) => {
  const sortMapping: Record<string, string> = {
    date: 'date',
    eventType: 'eventType',
    totalAmount: 'totalAmount',
    fundingId: 'fundingId',
    txHash: 'txHash',
    eventId: 'eventId'
  }

  return [`${sortMapping[sortBy] ?? 'date'},${sortOrder}`]
}

export interface EventMilestoneView {
  milestoneId: string
  milestoneTitle: string
  amountRcy: number
}

export interface EventAllocationView {
  projectId: string
  projectTitle: string
  subProjectTitle: string | null
  milestones: EventMilestoneView[]
}

export interface EventItemView {
  amountRcy: number
  amountFcy: number | null
  vendor: string | null
  spendingCategory: string | null
  fxRate: string | null
  hash: string | null
  notes: string | null
  date: string | null
  currencyId: string | null
  currencyCustCode: string | null
}

export interface EventView {
  id: number
  txHash: string
  organisationId: string
  eventId: string
  eventType: string
  eventCategory: string
  fundingTx: string | null
  fundingId: string | null
  fundingEntity: string | null
  date: string | null
  version: string | null
  ipfsCid: string | null
  totalAmount: number | null
  allocations: EventAllocationView[]
  items: EventItemView[]
  customData: Record<string, unknown> | null
}

export interface EventResponseView {
  success: boolean
  total: number
  page: number
  size: number
  events: EventView[]
  error: Record<string, unknown> | null
}

export interface PostPublicEventsRequestParameters {
  page: number
  size: number
  sort: string[]
}

export interface PostPublicEventsRequestBody {
  organisationId: string
  eventTypes?: string[]
  categories?: string[]
  projectIds?: string[]
  fundingIds?: string[]
  blockChainHash?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}

export interface PostPublicEventsRequest {
  body: PostPublicEventsRequestBody
  parameters: PostPublicEventsRequestParameters
}

export type PostPublicEventsResponse200 = EventResponseView

export interface GetEventsByTxRequestParameters {
  txHash: string
}

export interface GetEventsByTxRequest {
  parameters: GetEventsByTxRequestParameters
}

export type GetEventsByTxResponse200 = EventResponseView

export interface GetEventEntityRequestParameters {
  organisationId: string
}

export interface GetEventTypesRequest {
  parameters: GetEventEntityRequestParameters
}

export type GetEventTypesResponse200 = string[]

export interface EventProjectEntity {
  projectId: string
  projectTitle: string
}

export interface GetEventProjectsRequest {
  parameters: GetEventEntityRequestParameters
}

export type GetEventProjectsResponse200 = EventProjectEntity[]

export interface EventMilestoneView {
  milestoneId: string
  milestoneTitle: string
  allocatedAmount: number | null
}

export interface EventAllocationView {
  projectId: string
  projectTitle: string
  subProjectId: string | null
  subProjectTitle: string | null
  milestones: EventMilestoneView[]
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
  amountRcy: number | null
  amountFcy: number | null
  vendor: string | null
  spendingCategory: string | null
  fxRate: string | null
  hash: string | null
  notes: string | null
  currencyId: string | null
  currencyCustCode: string | null
  date: string | null
  version: string | null
  ipfsCid: string | null
  totalAmount: number | null
  allocations: EventAllocationView[]
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
  search?: string
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

export interface MilestoneAuditView {
  milestoneId: string | null
  milestoneTitle: string | null
  allocatedAmount: number
  spentAmount: number
}

export interface ProjectAuditView {
  projectKey: string | null
  projectId: string | null
  projectTitle: string | null
  currency: string | null
  allocatedAmount: number
  spentAmount: number
  remaining: number
  milestones: MilestoneAuditView[]
}

export interface AuditEventLineView {
  eventId: string | null
  txHash: string | null
  fundingTx: string | null
  eventType: string | null
  eventCategory: string | null
  date: string | null
  amount: number
  currency: string | null
  fundingId: string | null
  fundingEntity: string | null
  vendor: string | null
  spendingCategory: string | null
  projectKey: string | null
  projectId: string | null
  projectTitle: string | null
}

export interface AuditSummaryView {
  organisationId: string
  organisationName: string | null
  currency: string | null
  totalFunded: number
  totalSpent: number
  totalRefunded: number
  netRemaining: number
  fundingCount: number
  spendingCount: number
  refundCount: number
  firstEventDate: string | null
  lastEventDate: string | null
  projects: ProjectAuditView[]
  events: AuditEventLineView[]
}

export interface GetEventAuditRequestParameters {
  organisationId: string
  dateFrom?: string
  dateTo?: string
  projectIds?: string[]
}

export interface GetEventAuditRequest {
  parameters: GetEventAuditRequestParameters
}

export type GetEventAuditResponse200 = AuditSummaryView

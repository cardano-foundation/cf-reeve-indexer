export interface LabelCount {
  label: string
  count: number
}

export interface MonthCount {
  /** yyyy-MM */
  month: string
  count: number
}

export interface MonthAmounts {
  /** yyyy-MM */
  month: string
  funded: number
  spent: number
  refunded: number
}

export interface CurrencyTotals {
  currency: string
  funded: number
  spent: number
  refunded: number
}

export interface RecentTransaction {
  id: string
  txHash: string
  internalNumber: string
  type: string
  date: string
  organisationId: string
  organisationName?: string
  itemCount: number
}

export interface RecentReport {
  txHash?: string
  subType?: string
  interval?: string
  year?: number
  period?: number
  ver?: number
  identityVerified: boolean
  organisationId: string
  organisationName?: string
}

export interface RecentEvent {
  id: number
  txHash: string
  eventId: string
  eventType: string
  date?: string
  totalAmount?: number
  currency?: string
  counterparty?: string
  organisationId: string
  organisationName?: string
}

export interface TransactionOverview {
  total: number
  itemCount: number
  batchCount: number
  projectCount: number
  counterpartyCount: number
  firstDate?: string
  lastDate?: string
  byType: LabelCount[]
  monthly: MonthCount[]
  recent: RecentTransaction[]
}

export interface ReportOverview {
  total: number
  publications: number
  verified: number
  certificates: number
  bySubType: LabelCount[]
  byInterval: LabelCount[]
  byYear: LabelCount[]
  recent: RecentReport[]
}

export interface FundingOverview {
  eventCount: number
  projectCount: number
  fundingRoundCount: number
  primaryCurrency?: string
  totals: CurrencyTotals[]
  byType: LabelCount[]
  monthly?: MonthAmounts[]
  recent: RecentEvent[]
}

export interface DashboardOverview {
  organisationId?: string
  organisationCount: number
  transactions: TransactionOverview
  reports: ReportOverview
  funding: FundingOverview
}

export interface GetDashboardOverviewRequest {
  parameters: {
    organisationId?: string
  }
}

export type GetDashboardOverviewResponse200 = DashboardOverview

import { BalanceSheetSubmetric, IncomeStatementSubmetric, Metric } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.types.ts'

export enum Template {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE'
}

interface DashboardChart {
  width: number
  height: number
  metric: Metric
  subMetric: BalanceSheetSubmetric | IncomeStatementSubmetric
  ypos: number
  xpos: number
}

export interface GetDashboardsRequest {
  organisationId: string
}

export interface GetDashboardsResponse {
  id: number
  name: Template
  description: string
  charts: DashboardChart[]
}

export type GetDashboardsResponse200 = GetDashboardsResponse[]

export interface SaveDashboardRequest {
  dashboards: Omit<GetDashboardsResponse, 'id'>[]
  organisationId: string
}

export interface UpdateDashboardRequest {
  dashboard: GetDashboardsResponse
  organisationId: string
}

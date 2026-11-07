export interface TransactionsOverview {
  periodFrom: string
  periodTo: string
  transactionsCount: number
  itemsCount: number
  lastUpdated: string
}

export const mockTransactionsOverview: TransactionsOverview = {
  periodFrom: '2026-01-01',
  periodTo: '2026-06-30',
  transactionsCount: 37261,
  itemsCount: 46560,
  lastUpdated: '2026-07-15'
}

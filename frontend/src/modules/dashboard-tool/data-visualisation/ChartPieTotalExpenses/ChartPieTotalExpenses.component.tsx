import { Expense } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.types.ts'
import { ChartPieAnalytics, ChartPieAnalyticsProps } from 'modules/dashboard-tool/data-visualisation/ChartPieAnalytics/ChartPieAnalytics.component.tsx'

interface ChartPieTotalExpensesProps extends ChartPieAnalyticsProps<Expense> {}

export const ChartPieTotalExpenses = ({ data }: ChartPieTotalExpensesProps) => {
  return <ChartPieAnalytics data={data} />
}

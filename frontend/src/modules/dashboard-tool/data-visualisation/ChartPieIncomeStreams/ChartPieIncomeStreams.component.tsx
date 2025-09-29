import { IncomeStream } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.types.ts'
import { ChartPieAnalytics, ChartPieAnalyticsProps } from 'modules/dashboard-tool/data-visualisation/ChartPieAnalytics/ChartPieAnalytics.component.tsx'

interface ChartPieIncomeStreamsProps extends ChartPieAnalyticsProps<IncomeStream> {}

export const ChartPieIncomeStreams = ({ data }: ChartPieIncomeStreamsProps) => {
  return <ChartPieAnalytics data={data} />
}

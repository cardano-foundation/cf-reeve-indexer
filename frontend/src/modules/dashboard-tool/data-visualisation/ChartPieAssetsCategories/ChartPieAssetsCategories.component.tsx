import { AssetCategory } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.types.ts'
import { ChartPieAnalytics, ChartPieAnalyticsProps } from 'modules/dashboard-tool/data-visualisation/ChartPieAnalytics/ChartPieAnalytics.component.tsx'

interface ChartPieAssetsCategoriesProps extends ChartPieAnalyticsProps<AssetCategory> {}

export const ChartPieAssetsCategories = ({ data }: ChartPieAssetsCategoriesProps) => {
  return <ChartPieAnalytics data={data} />
}

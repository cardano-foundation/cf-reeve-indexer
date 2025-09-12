import { AssetCategory } from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.types.ts'
import { ChartPieAnalytics, ChartPieAnalyticsProps } from 'modules/dashboard-builder/data-visualisation/ChartPieAnalytics/ChartPieAnalytics.component.tsx'

interface ChartPieAssetsCategoriesProps extends ChartPieAnalyticsProps<AssetCategory> {}

export const ChartPieAssetsCategories = ({ data }: ChartPieAssetsCategoriesProps) => {
  return <ChartPieAnalytics data={data} />
}

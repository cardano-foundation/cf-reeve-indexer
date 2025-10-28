import { useDashboardFiltersForm } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.hooks.ts'
import { useChartsData } from 'modules/dashboard-tool/hooks/useChartsData.ts'
import { usePublicDashboardQueries } from 'modules/public-data-explorer-financial-overview/hooks/usePublicDashboardQueries.ts'

export const usePublicDashboard = () => {
  const { formik } = useDashboardFiltersForm()

  const { availableMetrics, dashboard, metrics, isFetching } = usePublicDashboardQueries({ formik })

  const data = useChartsData(availableMetrics, metrics)

  return {
    dashboard,
    data,
    formik,
    isFetching
  }
}

import dayjs from 'dayjs'
import { FormikProps } from 'formik'

import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGetDashboardsModel } from 'libs/models/dashboards-model/GetDashboards/GetDashboardsModel.service.ts'
import { useGetAvailableMetricsModel } from 'libs/models/metrics-model/GetAvailableMetrics/GetAvailableMetricsModel.service.ts'
import { useGetMetricsModel } from 'libs/models/metrics-model/GetMetrics/GetMetricsModel.service.ts'
import { DashboardFiltersFormValues } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.types.ts'

const FALLBACK_METRICS = { metrics: { BALANCE_SHEET: [], INCOME_STATEMENT: [] } }

export const getDatesPayload = (period: string) => {
  const year = Number(period.split(' ')[0])
  const startDate = dayjs().set('year', year).startOf('year').format('YYYY-MM-DD')
  const endDate = dayjs().set('year', year).endOf('year').format('YYYY-MM-DD')

  return { startDate, endDate }
}

interface PublicDashboardQueriesState {
  formik: FormikProps<DashboardFiltersFormValues>
}

export const usePublicDashboardQueries = (state: PublicDashboardQueriesState) => {
  const { formik } = state

  const { values } = formik

  const selectedOrganisation = useSelectedOrganisation()

  const { availableMetrics, isAvailableMetricsFetching } = useGetAvailableMetricsModel()
  const { metrics, isMetricsFetching } = useGetMetricsModel(
    {
      ...getDatesPayload(values.period),
      organisationId: selectedOrganisation,
      metricView: availableMetrics ? availableMetrics : FALLBACK_METRICS
    },
    Boolean(availableMetrics)
  )
  const { dashboards, isDashboardsFetching } = useGetDashboardsModel({ organisationId: selectedOrganisation })

  const [dashboard] = dashboards ?? []

  const isFetching = isAvailableMetricsFetching || isMetricsFetching || isDashboardsFetching

  return {
    availableMetrics,
    dashboard,
    metrics,
    isFetching
  }
}

import { useEffect } from 'react'

import { useLocationState } from 'hooks'
import { useDashboardFiltersForm } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.hooks.ts'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { useDashboardQueries } from 'modules/dashboard/hooks/useDashoardQueries.ts'
import { useChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'

interface DashboardLocationState {
  hasDashboardCreated: boolean
}

export const useDashboard = () => {
  const { state } = useLocationState<DashboardLocationState>()

  const { formik } = useDashboardFiltersForm()

  const { availableMetrics, dashboard, metrics, hasDashboard, isFetching } = useDashboardQueries({ formik })

  const data = useChartsData(availableMetrics, metrics)

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  const { hasDashboardCreated } = state ?? {}

  useEffect(() => {
    if (hasDashboardCreated) {
      showSnackbar()
    }
  }, [hasDashboardCreated])

  return {
    dashboard,
    data,
    formik,
    hasDashboard,
    isFetching,
    isSnackbarVisible,
    handleClose
  }
}

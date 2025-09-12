import Box from '@mui/material/Box'
import { FormikProvider } from 'formik'
import { Link as RouterLink } from 'react-router-dom'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useDashboard } from 'modules/dashboard/hooks/useDashboard.ts'
import { DashboardContentAdmin } from 'modules/dashboard/sections/DashboardContentAdmin/DashboardContentAdmin.component.tsx'
import { DashboardContentUser } from 'modules/dashboard/sections/DashboardContentUser/DashboardContentUser.component.tsx'
import { PATHS } from 'routes'

export const ViewDashboard = () => {
  const { t } = useTranslations()

  const { dashboard, data, formik, hasDashboard, isFetching, isSnackbarVisible, handleClose } = useDashboard()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'dashboardViewDescription' })} title={t({ id: 'dashboardViewTitle' })} />
        <Box alignItems="center" display="flex" gap={1}>
          {/* TODO: preview of the dashboard, uncomment it when more details are known */}
          {/* <IconButton color="primary" disabled>
            <ExportSquare size={24} variant="Outline" />
          </IconButton> */}
          {hasPermission('data_explorer', 'dashboard_edit') && hasDashboard && (
            <ButtonPrimary component={RouterLink} to={PATHS.DATA_EXPLORER_DASHBOARD_BUILDER}>
              {t({ id: 'edit' })}
            </ButtonPrimary>
          )}
        </Box>
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <FormikProvider value={formik}>
          {hasPermission('data_explorer', 'dashboard_create') ? (
            <DashboardContentAdmin dashboard={dashboard} hasDashboard={hasDashboard} data={data} isFetching={isFetching} />
          ) : (
            <DashboardContentUser dashboard={dashboard} hasDashboard={hasDashboard} data={data} isFetching={isFetching} />
          )}
        </FormikProvider>
      </LayoutAuth.Main>
      <Snackbar open={isSnackbarVisible} onClose={handleClose} message={t({ id: 'dashboardCreated' })} />
    </>
  )
}

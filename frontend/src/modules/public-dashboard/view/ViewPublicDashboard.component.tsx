import { FormikProvider } from 'formik'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { usePublicDashboard } from 'modules/public-dashboard/hooks/usePublicDashboard.ts'
import { PublicDashboardContent } from 'modules/public-dashboard/sections/PublicDashboardContent/PublicDashboardContent.component.tsx'

export const ViewPublicDashboard = () => {
  const { t } = useTranslations()

  const { dashboard, data, formik, isFetching } = usePublicDashboard()

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicDashboardDescription' })} title={t({ id: 'publicDashboardViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={{ xs: 2, sm: 6 }}>
        <FormikProvider value={formik}>
          <PublicDashboardContent dashboard={dashboard} data={data} isFetching={isFetching} />
        </FormikProvider>
      </LayoutPublic.Main>
    </>
  )
}

import Box from '@mui/material/Box'
import { GridEdit } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { publicDashboardIllustration } from 'assets/images'
import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component'
import { DashboardFilters } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { TemplateSelection } from 'modules/dashboard/components/TemplateSelection/TemplateSelection.component.tsx'
import { ChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'
import { Slots, TemplateSlotSelections } from 'modules/dashboard-builder/types'
import { getDefaultTemplateSlots } from 'modules/dashboard-builder/utils/templateSlot.ts'
import { PATHS } from 'routes'

interface DashboardContentAdminProps {
  dashboard: GetDashboardsResponse | null
  data: ChartsData
  hasDashboard: boolean
  isFetching: boolean
}

export const DashboardContentAdmin = ({ dashboard, data, hasDashboard, isFetching }: DashboardContentAdminProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  if (!dashboard) {
    return (
      <EmptyStatePage
        action={
          <ButtonPrimary component={RouterLink} startIcon={<GridEdit size={20} variant="Bold" />} to={PATHS.DATA_EXPLORER_DASHBOARD_BUILDER}>
            {t({ id: 'createDashboard' })}
          </ButtonPrimary>
        }
        asset={<Box alt="No dashboard" component="img" maxWidth="47.5rem" src={publicDashboardIllustration} width="100%" />}
        hint={t({ id: 'createYourDashboardHint' })}
        message={t({ id: 'nothingHereMessage' })}
      />
    )
  }

  const template = dashboard.name

  const slots = getDefaultTemplateSlots(template)

  const selection = slots.reduce<TemplateSlotSelections<Slots>>((acc, key, index) => ({ ...acc, [key]: dashboard?.charts[index]?.subMetric }), {} as TemplateSlotSelections<Slots>)

  return (
    <>
      <DashboardFilters isPeriodDisabled={!hasDashboard} />
      <TemplateSelection data={data} selection={selection} template={template} />
    </>
  )
}

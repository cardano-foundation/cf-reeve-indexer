import Box from '@mui/material/Box'

import { publicDashboardIllustration } from 'assets/images'
import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DashboardFilters } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { TemplateSelection } from 'modules/dashboard/components/TemplateSelection/TemplateSelection.component.tsx'
import { ChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'
import { Slots, TemplateSlotSelections } from 'modules/dashboard-builder/types'
import { getDefaultTemplateSlots } from 'modules/dashboard-builder/utils/templateSlot.ts'

interface DashboardContentUserProps {
  dashboard: GetDashboardsResponse | null
  data: ChartsData
  hasDashboard: boolean
  isFetching: boolean
}

export const DashboardContentUser = ({ dashboard, data, hasDashboard, isFetching }: DashboardContentUserProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  if (!dashboard) {
    return (
      <EmptyStatePage
        asset={<Box alt="No dashboard" component="img" maxWidth="47.5rem" src={publicDashboardIllustration} width="100%" />}
        hint={t({ id: 'noDashboardHint' })}
        message={t({ id: 'nothingHereMessage' })}
      />
    )
  }

  const template = dashboard.name

  const slots = getDefaultTemplateSlots(template)

  const selection = slots.reduce<TemplateSlotSelections<Slots>>(
    (acc, key, index) => ({ ...acc, [key]: dashboard?.charts[index]?.subMetric ?? null }),
    {} as TemplateSlotSelections<Slots>
  )

  return (
    <>
      <DashboardFilters isPeriodDisabled={!hasDashboard} />
      <TemplateSelection data={data} selection={selection} template={template} />
    </>
  )
}

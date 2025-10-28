import Box from '@mui/material/Box'

import { publicDashboardIllustration } from 'assets/images'
import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DashboardFilters } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { ChartsData } from 'modules/dashboard-tool/hooks/useChartsData'
import { Slots, TemplateSlotSelections } from 'modules/dashboard-tool/types'
import { getDefaultTemplateSlots } from 'modules/dashboard-tool/utils/templateSlot.ts'
import { TemplateSelection } from 'modules/public-data-explorer-financial-overview/components/TemplateSelection.component.tsx'

interface PublicDashboardContentProps {
  dashboard: GetDashboardsResponse | null
  data: ChartsData
  isFetching: boolean
}

export const PublicDashboardContent = ({ dashboard, data, isFetching }: PublicDashboardContentProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  if (!dashboard) {
    return (
      <EmptyStatePage
        asset={<Box alt={t({ id: 'noPublicDashboardMessage' })} component="img" maxWidth="47.5rem" src={publicDashboardIllustration} width="100%" />}
        hint={t({ id: 'noPublicDashboardHint' }, { organisation: 'Cardano Foundation' })}
        message={t({ id: 'noPublicDashboardMessage' })}
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
      <DashboardFilters isPeriodDisabled={false} />
      <TemplateSelection data={data} selection={selection} template={template} />
    </>
  )
}

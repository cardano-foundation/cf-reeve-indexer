import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DashboardFilters } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { ChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'
import { DashboardBuilderTemplate1 } from 'modules/dashboard-builder/templates/DashboardBuilderTemplate1/DashboardBuilderTemplate1.component.tsx'
import { DashboardBuilderTemplate2 } from 'modules/dashboard-builder/templates/DashboardBuilderTemplate2/DashboardBuilderTemplate2.component.tsx'
import { DashboardBuilderTemplate3 } from 'modules/dashboard-builder/templates/DashboardBuilderTemplate3/DashboardBuilderTemplate3.component.tsx'
import { SlotOption, SlotOptionId, Slots, Template, TemplateSlotSelections } from 'modules/dashboard-builder/types'

const templates = {
  [Template.ONE]: DashboardBuilderTemplate1,
  [Template.TWO]: DashboardBuilderTemplate2,
  [Template.THREE]: DashboardBuilderTemplate3
}

interface TemplateSelectionProps {
  data: ChartsData
  template: Template
  options: SlotOption[]
  selection: TemplateSlotSelections<Slots> | null
  isFetching: boolean
  onClear: (key: Slots) => void
  onSelect: (key: Slots, value: SlotOptionId) => void
}

export const TemplateSelection = ({ data, options, selection, template, isFetching, onClear, onSelect }: TemplateSelectionProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  const TemplateComponent = templates[template]

  return (
    <>
      <DashboardFilters />
      <TemplateComponent data={data} options={options} selection={selection} onClear={onClear} onSelect={onSelect} />
    </>
  )
}

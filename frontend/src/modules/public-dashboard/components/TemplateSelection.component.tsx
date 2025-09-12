import { ChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'
import { DashboardBuilderTemplate1 } from 'modules/dashboard-builder/templates/DashboardBuilderTemplate1/DashboardBuilderTemplate1.component.tsx'
import { DashboardBuilderTemplate2 } from 'modules/dashboard-builder/templates/DashboardBuilderTemplate2/DashboardBuilderTemplate2.component.tsx'
import { DashboardBuilderTemplate3 } from 'modules/dashboard-builder/templates/DashboardBuilderTemplate3/DashboardBuilderTemplate3.component.tsx'
import { Slots, Template, TemplateSlotSelections } from 'modules/dashboard-builder/types'

const templates = {
  [Template.ONE]: DashboardBuilderTemplate1,
  [Template.TWO]: DashboardBuilderTemplate2,
  [Template.THREE]: DashboardBuilderTemplate3
}

interface TemplateSelectionProps {
  data: ChartsData
  template: Template
  selection: TemplateSlotSelections<Slots> | null
}

export const TemplateSelection = ({ data, selection, template }: TemplateSelectionProps) => {
  const TemplateComponent = templates[template]

  return <TemplateComponent data={data} selection={selection} isReadOnly />
}

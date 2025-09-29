import { ChartsData } from 'modules/dashboard-tool/hooks/useChartsData.ts'
import { DashboardToolTemplate1 } from 'modules/dashboard-tool/templates/DashboardToolTemplate1/DashboardToolTemplate1.component.tsx'
import { DashboardToolTemplate2 } from 'modules/dashboard-tool/templates/DashboardToolTemplate2/DashboardToolTemplate2.component.tsx'
import { DashboardToolTemplate3 } from 'modules/dashboard-tool/templates/DashboardToolTemplate3/DashboardToolTemplate3.component.tsx'
import { Slots, Template, TemplateSlotSelections } from 'modules/dashboard-tool/types'

const templates = {
  [Template.ONE]: DashboardToolTemplate1,
  [Template.TWO]: DashboardToolTemplate2,
  [Template.THREE]: DashboardToolTemplate3
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

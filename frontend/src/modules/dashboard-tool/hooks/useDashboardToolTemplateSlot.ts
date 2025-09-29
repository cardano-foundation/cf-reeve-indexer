import { useEffect, useState } from 'react'

import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { SlotOption, SlotOptionId, Slots, SlotType, Template, TemplateSlotSelections } from 'modules/dashboard-tool/types'
import { getDefaultSelection, getDefaultTemplateSlots } from 'modules/dashboard-tool/utils/templateSlot.ts'

export const DASHBOARD_BUILDER_SLOT_OPTIONS: SlotOption[] = [
  { id: SlotOptionId.TOTAL_ASSETS, label: intl.formatMessage({ id: 'totalAssetsOption' }), type: SlotType.STATISTICS },
  { id: SlotOptionId.TOTAL_LIABILITIES, label: intl.formatMessage({ id: 'totalLiabilitiesOption' }), type: SlotType.STATISTICS },
  { id: SlotOptionId.PROFIT_OF_THE_YEAR, label: intl.formatMessage({ id: 'profitOfTheYearOption' }), type: SlotType.STATISTICS },
  { id: SlotOptionId.ASSET_CATEGORIES, label: intl.formatMessage({ id: 'assetsCategoriesOption' }), type: SlotType.CHART },
  { id: SlotOptionId.BALANCE_SHEET_OVERVIEW, label: intl.formatMessage({ id: 'balanceSheetOverviewOption' }), type: SlotType.CHART },
  { id: SlotOptionId.INCOME_STREAMS, label: intl.formatMessage({ id: 'incomeStreamsOption' }), type: SlotType.CHART },
  { id: SlotOptionId.TOTAL_EXPENSES, label: intl.formatMessage({ id: 'totalExpensesOption' }), type: SlotType.CHART }
]

const DASHBOARD_BUILDER_DEFAULT_TEMPLATE_1_SELECTION = getDefaultSelection(getDefaultTemplateSlots(Template.THREE))

const DASHBOARD_BUILDER_DEFAULT_TEMPLATE_2_SELECTION = getDefaultSelection(getDefaultTemplateSlots(Template.TWO))

const DASHBOARD_BUILDER_DEFAULT_TEMPLATE_3_SELECTION = getDefaultSelection(getDefaultTemplateSlots(Template.ONE))

const DASHBOARD_BUILDER_DEFAULT_SELECTION = {
  [Template.ONE]: DASHBOARD_BUILDER_DEFAULT_TEMPLATE_3_SELECTION,
  [Template.TWO]: DASHBOARD_BUILDER_DEFAULT_TEMPLATE_2_SELECTION,
  [Template.THREE]: DASHBOARD_BUILDER_DEFAULT_TEMPLATE_1_SELECTION
}

interface DashboardToolTemplateSlotState {
  dashboard: GetDashboardsResponse | null
  template: Template
}

export const useDashboardToolTemplateSlot = (state: DashboardToolTemplateSlotState) => {
  const { dashboard, template } = state

  const [selection, setSelection] = useState<TemplateSlotSelections<Slots>>(DASHBOARD_BUILDER_DEFAULT_SELECTION[Template.ONE])

  const options = DASHBOARD_BUILDER_SLOT_OPTIONS

  const isSaveDisabled = !selection || !Object.values(selection).every((value) => value)

  const isSelectionDirty = selection && Object.values(selection).some((value) => value !== null)

  const handleClear = (key: Slots) => {
    setSelection((prevSelection) => ({ ...prevSelection, [key]: null }) as TemplateSlotSelections<Slots>)
  }

  const handleSelect = (key: Slots, value: SlotOptionId) => {
    setSelection((prevSelection) => ({ ...prevSelection, [key]: value }) as TemplateSlotSelections<Slots>)
  }

  const handleResetSelection = (template: Template) => {
    setSelection(DASHBOARD_BUILDER_DEFAULT_SELECTION[template])
  }

  useEffect(() => {
    if (dashboard) {
      const slots = getDefaultTemplateSlots(template)

      const selection = slots.reduce<TemplateSlotSelections<Slots>>(
        (acc, key, index) => ({ ...acc, [key]: dashboard?.charts[index]?.subMetric }),
        {} as TemplateSlotSelections<Slots>
      )

      setSelection(selection)
    }
  }, [dashboard, setSelection])

  return {
    selection,
    options,
    isSaveDisabled,
    isSelectionDirty,
    handleClear,
    handleSelect,
    handleResetSelection
  }
}

import { ChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'

export enum Template {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE'
}

export enum Slots {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX = 'SIX',
  SEVEN = 'SEVEN'
}

export enum SlotOptionId {
  ASSET_CATEGORIES = 'ASSET_CATEGORIES',
  BALANCE_SHEET_OVERVIEW = 'BALANCE_SHEET_OVERVIEW',
  INCOME_STREAMS = 'INCOME_STREAMS',
  TOTAL_EXPENSES = 'TOTAL_EXPENSES',
  TOTAL_ASSETS = 'TOTAL_ASSETS',
  TOTAL_LIABILITIES = 'TOTAL_LIABILITIES',
  PROFIT_OF_THE_YEAR = 'PROFIT_OF_THE_YEAR'
}

export enum SlotType {
  CHART = 'CHART',
  STATISTICS = 'STATISTICS'
}

export interface SlotOption {
  id: SlotOptionId
  label: string
  type: SlotType
}

export type TemplateSlotSelections<T extends string> = Record<T, SlotOptionId | null>

interface DashboardBuilderTemplateReadOnlyProps {
  data: ChartsData
  options?: undefined
  selection: TemplateSlotSelections<Slots> | null
  onClear?: undefined
  onSelect?: undefined
  isReadOnly: true
}

interface DashboardBuilderTemplateWriteProps {
  data: ChartsData
  options: SlotOption[]
  selection: TemplateSlotSelections<Slots> | null
  onClear: (key: Slots) => void
  onSelect: (key: Slots, value: SlotOptionId) => void
  isReadOnly?: false
}

export type DashboardBuilderTemplateProps = DashboardBuilderTemplateReadOnlyProps | DashboardBuilderTemplateWriteProps

export interface DashboardSavedTemplate {
  template: Template
  slots: TemplateSlotSelections<Slots>
}

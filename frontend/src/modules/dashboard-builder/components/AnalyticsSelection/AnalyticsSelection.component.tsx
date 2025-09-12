import { useTemplateSlotContext } from 'modules/dashboard-builder/components/TemplateSlotContext/hooks/useTemplateSlotContext.ts'
import { ChartBarBalanceSheetOverview } from 'modules/dashboard-builder/data-visualisation/ChartBarBalanceSheetOverview/ChartBarBalanceSheetOverview.component.tsx'
import { ChartBarTotalExpenses } from 'modules/dashboard-builder/data-visualisation/ChartBarTotalExpenses/ChartBarTotalExpenses.component'
import { ChartPieAssetsCategories } from 'modules/dashboard-builder/data-visualisation/ChartPieAssetsCategories/ChartPieAssetsCategories.component'
import { ChartPieIncomeStreams } from 'modules/dashboard-builder/data-visualisation/ChartPieIncomeStreams/ChartPieIncomeStreams.component.tsx'
import { Statistics } from 'modules/dashboard-builder/data-visualisation/Statistics/Statistics.component.tsx'
import { ChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'
import { SlotOptionId } from 'modules/dashboard-builder/types'
import { getBalanceSheetOverviewData, getPieData, getStatisticData, getTotalExpensesData } from 'modules/dashboard-builder/utils/chartsData.ts'

interface AnalyticsSelectionProps {
  data: ChartsData
}

export const AnalyticsSelection = ({ data }: AnalyticsSelectionProps) => {
  const { name, selection } = useTemplateSlotContext()

  const profitsOfTheYear = Object.values(data?.PROFIT_OF_THE_YEAR).reduce((acc, value) => acc + value, 0)

  const balanceSheetOverviewData = getBalanceSheetOverviewData(data?.BALANCE_SHEET_OVERVIEW)
  const assetsCategoriesData = getPieData(data?.ASSET_CATEGORIES)
  const incomeStreamsData = getPieData(data?.INCOME_STREAMS)
  const totalAssetsData = getStatisticData(data?.TOTAL_ASSETS)
  const totalLiabilitiesData = getStatisticData(data?.TOTAL_LIABILITIES)
  const profitOfTheYearData = getStatisticData(profitsOfTheYear)
  const totalExpensesData = getTotalExpensesData(data?.TOTAL_EXPENSES)

  const slotOptionComponents = {
    [SlotOptionId.ASSET_CATEGORIES]: <ChartPieAssetsCategories data={assetsCategoriesData} />,
    [SlotOptionId.BALANCE_SHEET_OVERVIEW]: <ChartBarBalanceSheetOverview data={balanceSheetOverviewData} />,
    [SlotOptionId.INCOME_STREAMS]: <ChartPieIncomeStreams data={incomeStreamsData} />,
    [SlotOptionId.TOTAL_EXPENSES]: <ChartBarTotalExpenses data={totalExpensesData} />,
    [SlotOptionId.TOTAL_ASSETS]: <Statistics value={totalAssetsData} />,
    [SlotOptionId.TOTAL_LIABILITIES]: <Statistics value={totalLiabilitiesData} />,
    [SlotOptionId.PROFIT_OF_THE_YEAR]: <Statistics value={profitOfTheYearData} />
  } as const

  return selection && selection[name] !== null ? slotOptionComponents[selection[name]] : null
}

import { useState } from 'react'

import { GetChartOfAccountResponse200 } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types.ts'

interface ChartOfAccountSelectionState {
  chartOfAccounts: GetChartOfAccountResponse200
}

export const useChartOfAccountsSelection = (state: ChartOfAccountSelectionState) => {
  const { chartOfAccounts } = state

  const [chartOfAccountId, setChartOfAccountId] = useState<string | null>(null)

  const handleChartOfAccountSelection = (customerCode: string) => {
    setChartOfAccountId(customerCode)
  }

  const handleChartOfAccountSelectionReset = () => {
    setChartOfAccountId(null)
  }

  const chartOfAccount = chartOfAccounts?.find(({ customerCode }) => customerCode === chartOfAccountId)

  return {
    chartOfAccount,
    handleChartOfAccountSelection,
    handleChartOfAccountSelectionReset
  }
}

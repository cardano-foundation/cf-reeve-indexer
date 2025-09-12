import { useState } from 'react'

import { GetCostCentersResponse200 } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'

interface CostCenterSelectionState {
  costCenters: GetCostCentersResponse200
}

export const useCostCentersSelection = (state: CostCenterSelectionState) => {
  const { costCenters } = state

  const [costCenterId, setCostCenterId] = useState<string | null>(null)

  const handleCostCenterSelection = (code: string) => {
    setCostCenterId(code)
  }

  const handleCostCenterSelectionReset = () => {
    setCostCenterId(null)
  }

  const costCenter = costCenters?.find(({ customerCode }) => customerCode === costCenterId)

  return {
    costCenter,
    handleCostCenterSelection,
    handleCostCenterSelectionReset
  }
}

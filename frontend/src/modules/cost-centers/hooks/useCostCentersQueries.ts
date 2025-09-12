import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGetCostCentersModel } from 'libs/models/cost-centers/GetCostCentersModel.service.ts'

export const useCostCentersQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()
  const { costCenters, isFetching } = useGetCostCentersModel(selectedOrganisation)

  const hasCostCenters = costCenters && costCenters.length > 0

  return { costCenters, hasCostCenters, isFetching }
}

import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetChartOfAccountsModel } from 'libs/models/chart-of-accounts/GetChartOfAccountsModel.service'

export const useChartOfAccountsQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()
  const { chartOfAccounts, isFetching } = useGetChartOfAccountsModel(selectedOrganisation)

  const hasChartOfAccounts = chartOfAccounts && chartOfAccounts.length > 0

  return { chartOfAccounts, hasChartOfAccounts, isFetching }
}

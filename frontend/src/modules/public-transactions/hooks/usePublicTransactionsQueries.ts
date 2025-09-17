import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetCurrenciesModel } from 'libs/models/organisation-model/GetCurrencies/GetCurrencies.service.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'

export const usePublicTransactionsQueries = () => {
  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel({ hasAuthorizationHeader: false })
  const { currencies, isFetching: isFetchingCurrencies } = useGetCurrenciesModel(selectedOrganisation)

  const isFetching = isFetchingOrganisations || isFetchingCurrencies

  return {
    organisations,
    currencies,
    isFetching
  }
}

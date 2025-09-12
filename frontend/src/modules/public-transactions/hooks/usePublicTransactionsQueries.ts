import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetCurrenciesModel } from 'libs/models/organisation-model/GetCurrencies/GetCurrencies.service.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'

export const usePublicTransactionsQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel({ hasAuthorizationHeader: false })
  const { currencies, isFetching: isFetchingCurrencies } = useGetCurrenciesModel(selectedOrganisation)

  const isFetching = isFetchingOrganisations || isFetchingCurrencies

  return {
    organisations,
    currencies,
    isFetching
  }
}

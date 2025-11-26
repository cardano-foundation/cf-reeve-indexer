import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useGetCurrenciesModel } from 'libs/models/organisation-model/GetCurrencies/GetCurrencies.service.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'

export const usePublicTransactionsQueries = () => {
  const { selectedOrganisation } = useLayoutPublicContext()
  
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel({ hasAuthorizationHeader: false })
  const { currencies, isFetching: isFetchingCurrencies } = useGetCurrenciesModel(selectedOrganisation)

  const isFetching = isFetchingOrganisations || isFetchingCurrencies

  return {
    organisations,
    currencies,
    isFetching
  }
}

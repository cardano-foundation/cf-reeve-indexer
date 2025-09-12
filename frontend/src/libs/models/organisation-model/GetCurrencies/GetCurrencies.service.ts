import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getCurrenciesQuery = async (id: string) => {
  const { organisationApi } = backendLobApi()

  const data = await organisationApi.getCurrencies(id)

  if (!data) return null

  return data
}

export const useGetCurrenciesModel = (id: string) => {
  const { data, isFetching } = useQuery({ queryKey: ['CURRENCIES'], queryFn: () => getCurrenciesQuery(id) })

  const sortedCurrencies = data?.sort((a, b) => a.customerCode.localeCompare(b.customerCode)) || []

  return {
    currencies: sortedCurrencies,
    isFetching
  }
}

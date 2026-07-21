import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getCardStatusQuery = async () => {
  const { cardsApi } = backendReeveApi()

  const data = await cardsApi.getStatus()

  if (!data) return null

  return data
}

export const useGetCardStatusModel = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['CARD_STATUS'],
    queryFn: getCardStatusQuery
  })

  return {
    issuanceEnabled: data?.issuance_enabled ?? false,
    isFetching
  }
}

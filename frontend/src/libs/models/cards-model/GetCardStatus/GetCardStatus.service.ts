import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getCardStatusQuery = async () => {
  const { cardsApi } = backendReeveApi()

  const data = await cardsApi.getStatus()

  if (!data) return null

  return data
}

// `issuance_enabled` is a deployment-time flag, so the default staleTime of 0 made every window
// refocus refetch it for nothing. Five minutes keeps a server-side flip visible without turning a
// tab switch into a request. Consumers must still gate structure on `isPending`, not `isFetching`
// — see this hook's return.
const CARD_STATUS_STALE_TIME_MS = 5 * 60 * 1000

export const useGetCardStatusModel = () => {
  const { data, isFetching, isPending } = useQuery({
    queryKey: ['CARD_STATUS'],
    queryFn: getCardStatusQuery,
    staleTime: CARD_STATUS_STALE_TIME_MS
  })

  return {
    issuanceEnabled: data?.issuance_enabled ?? false,
    // `isPending` is "never resolved, no data yet" — the only honest signal for deciding whether a
    // subtree renders at all. `isFetching` also goes true on BACKGROUND refetches, so gating a
    // stateful subtree on it unmounts and remounts that subtree (losing its state) every time the
    // query revalidates. Callers: render on `isPending`, show progress on `isFetching`.
    isFetching,
    isPending
  }
}

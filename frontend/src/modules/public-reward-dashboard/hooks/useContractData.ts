import { useQuery } from '@tanstack/react-query'
import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

export const useContractData = (tokenName: string) => {
  // Fetch current datum
  const {
    data: currentDatum,
    isFetching: isFetchingDatum,
    error: datumError
  } = useQuery({
    queryKey: ['CONTRACT_CURRENT_DATUM', tokenName],
    queryFn: async () => {
      const { contractApi } = backendReeveApi()
      return await contractApi.getCurrentDatum(tokenName)
    },
    enabled: !!tokenName
  })

  // Fetch datum history
  const {
    data: datumHistory,
    isFetching: isFetchingHistory,
    error: historyError
  } = useQuery({
    queryKey: ['CONTRACT_DATUM_HISTORY', tokenName],
    queryFn: async () => {
      const { contractApi } = backendReeveApi()
      return await contractApi.getDatumHistory(tokenName)
    },
    enabled: !!tokenName
  })

  // Fetch current redeemer
  const {
    data: currentRedeemer,
    isFetching: isFetchingRedeemer,
    error: redeemerError
  } = useQuery({
    queryKey: ['CONTRACT_CURRENT_REDEEMER', tokenName],
    queryFn: async () => {
      const { contractApi } = backendReeveApi()
      return await contractApi.getCurrentRedeemer(tokenName)
    },
    enabled: !!tokenName
  })

  return {
    currentDatum,
    datumHistory: datumHistory || [],
    currentRedeemer,
    isLoading: isFetchingDatum || isFetchingHistory || isFetchingRedeemer,
    errors: {
      datumError,
      historyError,
      redeemerError
    }
  }
}

import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getOrganisationCostCentersQuery = async ({ id }: { id: string }) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationCostCenters({ id })

  if (!data) return null

  return data
}

export const useGetOrganisationCostCentersModel = ({ id }: { id: string }) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_COST_CENTERS'], queryFn: () => getOrganisationCostCentersQuery({ id }) })

  return {
    organisationCostCenters: data ?? null,
    isOrganisationCostCentersFetching: isFetching
  }
}

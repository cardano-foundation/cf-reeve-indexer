import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UpdateOrganisationDTO } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const updateOrganisationQuery = async (payload: Partial<UpdateOrganisationDTO>) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.updateOrganisation({ payload })

  if (!data) return null

  return data
}

export const useUpdateOrganisationModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPDATE_ORGANISATION'], mutationFn: updateOrganisationQuery })

  return {
    updatedOrganisation: data ?? null,
    triggerUpdateOrganisation: mutateAsync
  }
}

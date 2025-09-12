import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UpdateOrganisationDTO } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types'

const updateOrganisationQuery = async (payload: Partial<UpdateOrganisationDTO>) => {
  const { organisationApi } = backendLobApi()

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

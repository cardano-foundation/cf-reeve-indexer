import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGetOrganisationModel } from 'libs/models/organisation-model/GetOrganisation/GetOrganisations.service.ts'

export const useDialogCostCentersQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { organisation, isFetching: isOrganisationFetching } = useGetOrganisationModel({ id: selectedOrganisation })

  const isFetching = isOrganisationFetching

  return {
    organisation,
    isFetching
  }
}

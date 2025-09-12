import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'

export const useReconciliationDialogQueries = () => {
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel()

  return {
    organisations,
    isFetching: isFetchingOrganisations
  }
}

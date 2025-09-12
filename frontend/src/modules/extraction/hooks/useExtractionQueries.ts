import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetOrganisationChartTypesModel } from 'libs/models/organisation-model/GetOrganisationChartTypes/GetOrganisationChartTypesModel.service.ts'
import { useGetOrganisationCostCentersModel } from 'libs/models/organisation-model/GetOrganisationCostCenters/GetOrganisationCostCentersModel.service.ts'
import { useGetOrganisationProjectsModel } from 'libs/models/organisation-model/GetOrganisationProjects/GetOrganisationProjectsModel.service.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts'

export const useExtractionQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()
  const { organisations, isFetching: isFetchingOrganisations } = useGetOrganisationsModel()
  const { organisationCostCenters, isOrganisationCostCentersFetching } = useGetOrganisationCostCentersModel({ id: selectedOrganisation })
  const { organisationProjects, isOrganisationProjectsFetching } = useGetOrganisationProjectsModel({ id: selectedOrganisation })
  const { organisationChartTypes, isOrganisationChartTypesFetching } = useGetOrganisationChartTypesModel({ id: selectedOrganisation })

  const isFetching = isFetchingOrganisations || isOrganisationCostCentersFetching || isOrganisationProjectsFetching || isOrganisationChartTypesFetching

  return {
    organisationChartTypes,
    organisationCostCenters,
    organisationProjects,
    organisations,
    isFetching
  }
}

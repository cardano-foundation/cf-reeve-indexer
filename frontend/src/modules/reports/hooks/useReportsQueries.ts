import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReportsModel } from 'libs/models/reports-model/GetReportsModel/GetReports.service.ts'

export const useReportsQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { reports, isFetching } = useGetReportsModel({ organisationId: selectedOrganisation })

  return { reports, isFetching }
}

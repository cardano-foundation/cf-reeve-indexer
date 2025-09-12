import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetRefCodesModel } from 'libs/models/ref-codes/GetRefCodes.service'

export const useRefCodesQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { refCodes, isFetching } = useGetRefCodesModel(selectedOrganisation)

  const hasRefCodes = refCodes && refCodes.length > 0

  return { refCodes, hasRefCodes, isFetching }
}

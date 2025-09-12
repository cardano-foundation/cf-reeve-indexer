import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGetVatCodesModel } from 'libs/models/vat-codes/GetVatCodesModel.service.ts'

export const useVatCodesQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { vatCodes, isVatCodesFetching } = useGetVatCodesModel(selectedOrganisation)

  const hasVatCodes = vatCodes && vatCodes.length > 0

  return {
    vatCodes,
    hasVatCodes,
    isFetching: isVatCodesFetching
  }
}

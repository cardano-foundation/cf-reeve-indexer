import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetEventCodesModel } from 'libs/models/event-codes/GetEventCodes.service'

export const useEventCodesQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()
  const { eventCodes, isFetching } = useGetEventCodesModel(selectedOrganisation)

  return {
    eventCodes: eventCodes ?? [],
    isFetching
  }
}

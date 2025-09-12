import { getUser } from 'libs/authentication/user/getUser.tsx'
import { PRESELECTED_ORGANISATION } from 'libs/const/organisation.ts'

export const useSelectedOrganisation = () => {
  const user = getUser()

  // NOTE: temporary solution for public pages
  return user?.selectedOrganisation || PRESELECTED_ORGANISATION
}

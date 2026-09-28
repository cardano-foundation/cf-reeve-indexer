import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'

export const useSelectedOrganisationName = () => {
  const { organisations, selectedOrganisation } = useLayoutPublicContext()

  return organisations.find((org) => org.id === selectedOrganisation)?.name || ''
}

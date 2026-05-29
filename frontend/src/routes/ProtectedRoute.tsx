import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'

interface ProtectedRouteProps {
  element: React.ReactNode
}

export const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const { organisationId: orgIdFromPath } = useParams<{ organisationId: string }>()
  const [searchParams] = useSearchParams()
  const { selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext()
  const { organisations, isFetching: isOrganisationsFetching } = useGetOrganisationsModel()

  const orgIdParam = orgIdFromPath || searchParams.get('organisation_id')

  useEffect(() => {
    if (orgIdParam && organisations && organisations.length > 0) {
      const organisationExists = organisations.some((o: any) => o.id === orgIdParam)
      if (organisationExists) {
        setSelectedOrganisation(orgIdParam)
      }
    }
  }, [orgIdParam, organisations, setSelectedOrganisation])

  // Wait for organisations to load if an organisation_id param is present
  if (orgIdParam && isOrganisationsFetching) {
    return null // Show nothing while loading
  }

  // If no organisation is selected but an organisation_id param is present, don't redirect yet
  // (the useEffect will set it on the next render)
  if (!selectedOrganisation && !orgIdParam) {
    return <Navigate to="/" replace />
  }

  return element
}

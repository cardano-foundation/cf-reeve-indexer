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

  // Wait only for the INITIAL organisations load (no data yet) when an organisation_id
  // param is present. Gating on `isFetching` alone also matches background re-fetches,
  // which unmounts the routed view mid-render and re-triggers its requests in an endless
  // loop (the view's mount re-arms the organisations re-fetch). Once we have organisations
  // data, background re-fetches must not unmount the view.
  if (orgIdParam && isOrganisationsFetching && !organisations?.length) {
    return null // Show nothing while loading
  }

  // If no organisation is selected but an organisation_id param is present, don't redirect yet
  // (the useEffect will set it on the next render)
  if (!selectedOrganisation && !orgIdParam) {
    return <Navigate to="/" replace />
  }

  return element
}

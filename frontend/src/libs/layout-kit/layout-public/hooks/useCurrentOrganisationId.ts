import { useParams } from 'react-router-dom'

import { OrganisationEntity } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'

export const useCurrentOrganisationId = () => {
  const { organisationId } = useParams<{ organisationId: string }>()
  const { selectedOrganisation } = useLayoutPublicContext()
  const { organisations, isPending } = useGetOrganisationsModel()

  const isPathOrganisationValid = Boolean(organisationId) && (isPending || Boolean(organisations?.some((organisation: OrganisationEntity) => organisation.id === organisationId)))

  return isPathOrganisationValid && organisationId ? organisationId : selectedOrganisation
}

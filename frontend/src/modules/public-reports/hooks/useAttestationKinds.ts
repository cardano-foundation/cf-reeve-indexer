import { useQueries } from '@tanstack/react-query'

import type { IdentityAttestationView, ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { getGLEIFVerificationQuery, getLegalName } from 'libs/hooks/useGLEIFVerification.ts'
import { useSelectedOrganisationName } from 'libs/layout-kit/layout-public/hooks/useSelectedOrganisationName.ts'
import type { AttestationKind } from 'modules/public-reports/components/ModalAttestation/ModalAttestation.types'
import { isSameOrganisationName } from 'modules/public-reports/utils/attestation.ts'

const getLeis = (identities: IdentityAttestationView[]) => [...new Set(identities.flatMap((identity) => (identity.lei ? [identity.lei] : [])))]

const getEntityKey = (identity: IdentityAttestationView) => identity.lei ?? identity.aid

const getUniqueEntities = (identities: IdentityAttestationView[]) =>
  identities.filter((identity, index) => identities.findIndex((other) => getEntityKey(other) === getEntityKey(identity)) === index)

export const useAttestationsLoading = (reports: ReportEntity[]) => {
  const organisationName = useSelectedOrganisationName()
  const leis = getLeis(reports.flatMap((report) => report.identities ?? []))

  const gleifQueries = useQueries({ queries: leis.map((lei) => getGLEIFVerificationQuery(lei)) })

  return !organisationName || gleifQueries.some((query) => query.isLoading)
}

export const useAttestationKinds = (identities: IdentityAttestationView[] | undefined) => {
  const organisationName = useSelectedOrganisationName()

  const identityList = identities ?? []
  const leis = getLeis(identityList)

  const gleifQueries = useQueries({ queries: leis.map((lei) => getGLEIFVerificationQuery(lei)) })

  const isLoading = !organisationName || gleifQueries.some((query) => query.isLoading)

  const isOrganisation = (identity: IdentityAttestationView) => {
    if (!identity.lei) return true

    const gleifData = gleifQueries[leis.indexOf(identity.lei)].data

    return !gleifData || isSameOrganisationName(organisationName, getLegalName(gleifData))
  }

  const identitiesByKind: Record<AttestationKind, IdentityAttestationView[]> = isLoading
    ? { organisation: [], auditor: [] }
    : {
        organisation: getUniqueEntities(identityList.filter(isOrganisation)),
        auditor: getUniqueEntities(identityList.filter((identity) => !isOrganisation(identity)))
      }

  return {
    identities: identitiesByKind,
    isLoading
  }
}

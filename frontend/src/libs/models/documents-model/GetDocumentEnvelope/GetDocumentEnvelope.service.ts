import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { Envelope } from 'libs/document-vault-crypto/decrypt'

// Lazy by design (I3): the envelope must never be fetched on page load, only on a
// deliberate user gesture, so this is a mutation rather than a query.
const getDocumentEnvelopeQuery = async ({ documentId, txHash }: { documentId: string; txHash?: string }) => {
  const { documentsApi } = backendReeveApi()

  return (await documentsApi.getDocumentEnvelope(documentId, txHash)) as Envelope
}

export const useGetDocumentEnvelopeModel = () => {
  const { mutateAsync, isPending, isError } = useMutation({
    mutationKey: ['DOCUMENT_ENVELOPE'],
    mutationFn: getDocumentEnvelopeQuery
  })

  return {
    fetchEnvelope: mutateAsync,
    isFetching: isPending,
    isError
  }
}

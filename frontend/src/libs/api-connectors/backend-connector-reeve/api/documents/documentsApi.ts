import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'

import { DocumentDetailResponse, DocumentListResponse, GetDocumentsParams } from './documentsApi.types'

// Documents endpoints are public (no auth required): the bearer header is suppressed
// the same way the other public APIs (eventsApi, dashboardsApi, ...) suppress it.
export const documentsApi = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  const getDocuments = (params: GetDocumentsParams) => {
    const { orgId, verdict, page, size, sort } = params

    const queryParams: string[] = []

    if (orgId) queryParams.push(`orgId=${encodeURIComponent(orgId)}`)
    if (verdict) queryParams.push(`verdict=${verdict}`)
    queryParams.push(`page=${page ?? 0}`)
    queryParams.push(`size=${size ?? 20}`)
    if (sort) queryParams.push(`sort=${encodeURIComponent(sort)}`)

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return get<DocumentListResponse>(`api/v1/documents${queryString}`, null, { Authorization: '' })
  }

  const getDocumentDetail = (documentId: string) =>
    get<DocumentDetailResponse>(`api/v1/documents/${encodeURIComponent(documentId)}`, null, { Authorization: '' })

  // Returned as unknown: the wire payload is untrusted until decryptEnvelope validates
  // its version/type (I7); callers cast to Envelope after that boundary.
  const getDocumentEnvelope = (documentId: string, txHash?: string): Promise<unknown> => {
    const queryString = txHash ? `?txHash=${encodeURIComponent(txHash)}` : ''

    return get<unknown>(`api/v1/documents/${encodeURIComponent(documentId)}/envelope${queryString}`, null, { Authorization: '' })
  }

  return {
    getDocuments,
    getDocumentDetail,
    getDocumentEnvelope
  }
}

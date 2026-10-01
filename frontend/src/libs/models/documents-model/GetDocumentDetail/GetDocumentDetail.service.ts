import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getDocumentDetailQuery = async (documentId: string) => {
  const { documentsApi } = backendReeveApi()

  const data = await documentsApi.getDocumentDetail(documentId)

  if (!data) return null

  return data
}

export const useGetDocumentDetailModel = (documentId: string | undefined) => {
  const { data, isFetching, isError } = useQuery({
    queryKey: ['DOCUMENT_DETAIL', documentId],
    queryFn: () => getDocumentDetailQuery(documentId as string),
    enabled: Boolean(documentId)
  })

  return {
    detail: data ?? null,
    isFetching,
    isError
  }
}

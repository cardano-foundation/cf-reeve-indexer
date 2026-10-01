import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetDocumentsParams } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

const getDocumentsQuery = async (params: GetDocumentsParams) => {
  const { documentsApi } = backendReeveApi()

  const data = await documentsApi.getDocuments(params)

  if (!data) return null

  return data
}

export const useGetDocumentsModel = (params: GetDocumentsParams) => {
  const { data, isFetching, isError } = useQuery({
    queryKey: ['DOCUMENTS', params],
    queryFn: () => getDocumentsQuery(params),
    placeholderData: keepPreviousData
  })

  return {
    documents: data ?? null,
    isFetching,
    isError
  }
}

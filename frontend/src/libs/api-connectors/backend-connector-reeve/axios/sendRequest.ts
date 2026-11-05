import axios, { AxiosRequestConfig, ResponseType as AxiosResponseType } from 'axios'

import { DEFAULT_CONTENT_TYPE_HEADERS } from 'libs/api-connectors/backend-connector-reeve/const/headers.consts.ts'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'

export const sendRequest = async <TResponse>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  headers?: Record<string, string>,
  body?: unknown,
  params?: Record<string, string | number>,
  responseType?: ResponseType
): Promise<TResponse> => {
  const accessToken = getSessionStorageItem('accessToken')

  // Authorization resolution: '' suppresses the header (public endpoints, e.g. the cards status flag),
  // a non-empty value is sent as-is, otherwise default to the session Bearer token.
  const resolveAuthorizationHeader = (): string | undefined => {
    if (headers?.Authorization === '') return undefined
    if (headers?.Authorization) return headers.Authorization
    return `Bearer ${accessToken}`
  }

  const request: AxiosRequestConfig = {
    method,
    url,
    data: body,
    headers: {
      ...DEFAULT_CONTENT_TYPE_HEADERS,
      ...headers,
      Authorization: resolveAuthorizationHeader()
    },
    params,
    responseType
  }

  const response = await axios.request(request)

  if (response?.status.toString().startsWith('2')) {
    return response.data
  }

  throw new Error(`Error call: ${method} ${url}. Status code is not 200. Details: ${JSON.stringify(response)}`)
}

export type ResponseType = AxiosResponseType

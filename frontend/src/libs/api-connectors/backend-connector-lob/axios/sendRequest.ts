import axios, { AxiosRequestConfig, ResponseType as AxiosResponseType } from 'axios'

import { DEFAULT_CONTENT_TYPE_HEADERS } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'

import { activateInterceptors } from './interceptors'

activateInterceptors()

export const sendRequest = async <TResponse>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  headers?: Record<string, string>,
  body?: unknown,
  params?: Record<string, string | number>,
  responseType?: ResponseType
): Promise<TResponse> => {
  const accessToken = getSessionStorageItem('accessToken')

  const request: AxiosRequestConfig = {
    method,
    url,
    data: body,
    headers: {
      ...DEFAULT_CONTENT_TYPE_HEADERS,
      ...headers,
      Authorization: headers?.Authorization === '' ? undefined : `Bearer ${accessToken}`
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

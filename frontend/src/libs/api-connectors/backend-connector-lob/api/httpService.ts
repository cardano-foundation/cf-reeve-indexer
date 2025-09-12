import { ResponseType, sendRequest } from '../axios/sendRequest'

const createUrl = (...urls: string[]) => {
  return urls.join('/')
}

export const httpService = (baseUrl: string) => {
  const get = async <TResponse>(endpoint: string, params?: unknown, headers?: Record<string, string>, responseType?: ResponseType): Promise<TResponse> => {
    const url = createUrl(baseUrl, endpoint)

    const response = await sendRequest<TResponse>('GET', url, headers, null, params as Record<string, string>, responseType)

    if (response === undefined) throw new Error('GET Response cannot be undefined')

    return response
  }

  const post = async <TResponse, TRequest>(endpoint: string, request?: TRequest, headers?: Record<string, string>): Promise<TResponse> => {
    const url = createUrl(baseUrl, endpoint)

    return sendRequest<TResponse>('POST', url, headers, request)
  }

  const patch = async <TResponse, TRequest>(endpoint: string, request?: TRequest): Promise<TResponse> => {
    const url = createUrl(baseUrl, endpoint)

    return sendRequest<TResponse>('PATCH', url, {}, request)
  }

  const put = async <TResponse, TRequest>(endpoint: string, request?: TRequest, headers?: Record<string, string>): Promise<TResponse> => {
    const url = createUrl(baseUrl, endpoint)

    const response = await sendRequest<TResponse>('PUT', url, headers, request)

    if (response === undefined) throw new Error('PUT Response cannot be undefined')

    return response
  }

  const remove = async <TResponse, TRequest>(endpoint: string, request?: TRequest): Promise<TResponse> => {
    const url = createUrl(baseUrl, endpoint)

    return sendRequest<TResponse>('DELETE', url, {}, request)
  }

  return {
    get,
    post,
    patch,
    put,
    remove
  }
}

import {
  GetEventAuditRequest,
  GetEventAuditResponse200,
  GetEventProjectsRequest,
  GetEventProjectsResponse200,
  GetEventsByTxRequest,
  GetEventsByTxResponse200,
  GetEventTypesRequest,
  GetEventTypesResponse200,
  PostPublicEventsRequest,
  PostPublicEventsRequestBody,
  PostPublicEventsResponse200
} from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'

export const eventsApi = (baseUrl: string) => {
  const { get, post } = httpService(baseUrl)

  const getEvents = (request: PostPublicEventsRequest) => {
    const {
      parameters: { page, size, sort },
      body
    } = request

    const url = 'api/v1/events'

    const queryParams = []

    if (page !== undefined) {
      queryParams.push(`page=${page}`)
    }

    if (size !== undefined) {
      queryParams.push(`size=${size}`)
    }

    if (sort !== undefined) {
      queryParams.push(`sort=${sort}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return post<PostPublicEventsResponse200, PostPublicEventsRequestBody>(`${url}${queryString}`, body, { Authorization: '' })
  }

  const getEventsByTx = (request: GetEventsByTxRequest) => {
    const {
      parameters: { txHash }
    } = request

    return get<GetEventsByTxResponse200>(`api/v1/events/by-tx/${txHash}`, null, { Authorization: '' })
  }

  const getEventTypes = (request: GetEventTypesRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetEventTypesResponse200>(`api/v1/events/types/${organisationId}`, null, { Authorization: '' })
  }

  const getEventProjects = (request: GetEventProjectsRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetEventProjectsResponse200>(`api/v1/events/projects/${organisationId}`, null, { Authorization: '' })
  }

  const getEventAudit = (request: GetEventAuditRequest) => {
    const {
      parameters: { organisationId, dateFrom, dateTo }
    } = request

    const queryParams = []

    if (dateFrom) {
      queryParams.push(`dateFrom=${dateFrom}`)
    }

    if (dateTo) {
      queryParams.push(`dateTo=${dateTo}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return get<GetEventAuditResponse200>(`api/v1/events/audit/${organisationId}${queryString}`, null, { Authorization: '' })
  }

  return {
    getEvents,
    getEventsByTx,
    getEventTypes,
    getEventProjects,
    getEventAudit
  }
}

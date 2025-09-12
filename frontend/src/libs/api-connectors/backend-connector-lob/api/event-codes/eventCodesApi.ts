import {
  EventCodeResponse,
  GetEventCodesResponse200,
  PostEventCodeRequest,
  UploadEventCodesResponse200,
  UploadEventCodesRequest
} from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'
import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import { Headers, MediaTypes } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'

export const eventCodesApi = (baseUrl: string) => {
  const { post, get, put } = httpService(baseUrl)

  const getEventCodes = (organisationId: string) => {
    return get<GetEventCodesResponse200>(`api/v1/organisations/${organisationId}/event-codes`, null)
  }

  const createEventCode = (data: PostEventCodeRequest) => {
    const { organisationId, ...payload } = data

    return post<EventCodeResponse, Partial<PostEventCodeRequest>>(`api/v1/organisations/${organisationId}/event-codes`, payload)
  }

  const updateEventCode = (data: PostEventCodeRequest) => {
    const { organisationId, ...payload } = data

    return put<EventCodeResponse, Partial<PostEventCodeRequest>>(`api/v1/organisations/${organisationId}/event-codes`, payload)
  }

  const uploadEventCodes = (payload: UploadEventCodesRequest) => {
    const {
      parameters: { organisationId },
      body
    } = payload

    return post<UploadEventCodesResponse200, FormData>(`api/v1/organisations/${organisationId}/event-codes`, body, { [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA })
  }

  return {
    getEventCodes,
    createEventCode,
    updateEventCode,
    uploadEventCodes
  }
}

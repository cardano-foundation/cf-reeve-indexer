import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  GetRefCodesResponse200,
  PostRefCodeRequest,
  RefCodeResponse,
  UploadRefCodeResponse200,
  UploadRefCodesRequest
} from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { Headers, MediaTypes } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'

export const refCodesApi = (baseUrl: string) => {
  const { post, put, get } = httpService(baseUrl)

  const getRefCodes = (organisationId: string) => {
    return get<GetRefCodesResponse200>(`api/v1/organisations/${organisationId}/reference-codes`)
  }

  const createRefCode = (data: PostRefCodeRequest) => {
    const { organisationId, ...payload } = data

    return post<RefCodeResponse, Partial<PostRefCodeRequest>>(`api/v1/organisations/${organisationId}/reference-codes`, payload)
  }

  const updateRefCode = (data: PostRefCodeRequest) => {
    const { organisationId, ...payload } = data

    return put<RefCodeResponse, Partial<PostRefCodeRequest>>(`api/v1/organisations/${organisationId}/reference-codes`, payload)
  }

  const uploadRefCodes = (payload: UploadRefCodesRequest) => {
    const {
      parameters: { organisationId },
      body
    } = payload

    return post<UploadRefCodeResponse200, FormData>(`api/v1/organisations/${organisationId}/reference-codes`, body, { [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA })
  }

  return {
    getRefCodes,
    createRefCode,
    updateRefCode,
    uploadRefCodes
  }
}

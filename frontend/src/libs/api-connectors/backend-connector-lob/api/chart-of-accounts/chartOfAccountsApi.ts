import {
  ChartOfAccount,
  GetChartOfAccountResponse200,
  PostChartOfAccountRequest,
  UploadChartOfAccountsResponse200,
  UploadChartOfAccountsRequest
} from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types.ts'
import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import { Headers, MediaTypes } from 'libs/api-connectors/backend-connector-lob/const/headers.consts.ts'

export const chartOfAccountsApi = (baseUrl: string) => {
  const { put, get, post } = httpService(baseUrl)

  const getChartOfAccounts = (organisationId: string) => {
    return get<GetChartOfAccountResponse200>(`api/v1/organisations/${organisationId}/chart-of-accounts`)
  }

  const createChartOfAccounts = (data: Partial<PostChartOfAccountRequest>) => {
    const { organisationId, ...payload } = data

    return post<ChartOfAccount, Partial<PostChartOfAccountRequest>>(`api/v1/organisations/${organisationId}/chart-of-accounts`, payload)
  }

  const updateChartOfAccounts = (data: Partial<PostChartOfAccountRequest>) => {
    const { organisationId, ...payload } = data

    return put<ChartOfAccount, Partial<PostChartOfAccountRequest>>(`api/v1/organisations/${organisationId}/chart-of-accounts`, payload)
  }

  const uploadChartOfAccounts = (payload: UploadChartOfAccountsRequest) => {
    const {
      parameters: { organisationId },
      body
    } = payload

    return post<UploadChartOfAccountsResponse200, FormData>(`api/v1/organisations/${organisationId}/chart-of-accounts`, body, {
      [Headers.CONTENT_TYPE]: MediaTypes.MULTIPART_FORM_DATA
    })
  }

  return {
    getChartOfAccounts,
    createChartOfAccounts,
    updateChartOfAccounts,
    uploadChartOfAccounts
  }
}

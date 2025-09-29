import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import {
  GetReportsResponse200,
  GetPublicReportsRequest,
} from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export const reportsApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const getReports = (parameters: GetPublicReportsRequest) => {
    return post<GetReportsResponse200, GetPublicReportsRequest>(`api/v1/public/reports`, { ...parameters }, { Authorization: '' })
  }

  return {
    getReports
  }
}

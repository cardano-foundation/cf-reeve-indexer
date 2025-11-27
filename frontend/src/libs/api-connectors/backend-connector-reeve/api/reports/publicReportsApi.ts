import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import { GetPublicReportsResponse200, GetPublicReportsRequest, GetPublicReportsRequestBody } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export const reportsApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const getPublicReports = (request: GetPublicReportsRequest) => {
    const {
      parameters: { page, size, sort },
      body
    } = request

    const url = 'api/v1/reports'

    let queryParams = []

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

    return post<GetPublicReportsResponse200, GetPublicReportsRequestBody>(`${url}${queryString}`, body, { Authorization: '' })
  }

  return {
    getPublicReports
  }
}

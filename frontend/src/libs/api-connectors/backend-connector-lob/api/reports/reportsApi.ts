import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  GetReportParametersRequest,
  GetReportParametersResponse200,
  GetReportsRequest,
  GetReportsResponse200,
  CreateReportRequest,
  CreateReportResponse200,
  SearchReportRequest,
  SearchReportResponse200,
  PublishReportRequest,
  PublishReportResponse200,
  GetPublicReportsRequest,
  GenerateReportRequest,
  GenerateReportResponse200
} from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'

export const reportsApi = (baseUrl: string) => {
  const { get, post } = httpService(baseUrl)

  const getReportParameters = ({ organisationId }: GetReportParametersRequest) => {
    return get<GetReportParametersResponse200>(`api/v1/report-parameters/${organisationId}`)
  }

  const getReports = ({ organisationId }: GetReportsRequest) => {
    return get<GetReportsResponse200>(`api/v1/report-list/${organisationId}`)
  }

  const getPublicReports = (parameters: GetPublicReportsRequest) => {
    return post<GetReportsResponse200, GetPublicReportsRequest>(`api/v1/public/reports`, { ...parameters }, { Authorization: '' })
  }

  const createReport = (parameters: CreateReportRequest) => {
    return post<CreateReportResponse200, CreateReportRequest>(`api/v1/report-create`, { ...parameters })
  }

  const publishReport = (parameters: PublishReportRequest) => {
    return post<PublishReportResponse200, PublishReportRequest>(`api/v1/report-publish`, { ...parameters })
  }

  const searchReport = (parameters: SearchReportRequest) => {
    return post<SearchReportResponse200, SearchReportRequest>(`api/v1/report-search`, { ...parameters })
  }

  const generateReport = (parameters: GenerateReportRequest) => {
    return post<GenerateReportResponse200, GenerateReportRequest>(`api/v1/report-generate`, { ...parameters })
  }

  return {
    getReportParameters,
    getReports,
    getPublicReports,
    createReport,
    publishReport,
    searchReport,
    generateReport
  }
}

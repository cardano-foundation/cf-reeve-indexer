import { GetReportsResponse200, ReportApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { TableReports } from 'modules/reports/components/TableReports/TableReports.component.tsx'

interface SectionReportsProps {
  reports: GetReportsResponse200 | null
  onViewOpen: (report: ReportApiResponse) => void
  isFetching: boolean
}

export const SectionReports = ({ reports, onViewOpen, isFetching }: SectionReportsProps) => {
  return <TableReports data={reports?.report ?? []} onViewOpen={onViewOpen} isFetching={isFetching} />
}

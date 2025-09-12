import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ModalReport } from 'modules/reporting/components'
import { useReports } from 'modules/reports/hooks/useReports.ts'
import { SectionReports } from 'modules/reports/sections/SectionReports/SectionReports.component.tsx'

export const ViewReports = () => {
  const { t } = useTranslations()

  const { report, reports, handleReportViewClose, handleReportViewOpen, isFetching, isReportViewOpen } = useReports()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'reportsViewDescription' })} title={t({ id: 'reportsViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6} isHeightRestricted>
        <SectionReports reports={reports} onViewOpen={handleReportViewOpen} isFetching={isFetching} />
      </LayoutAuth.Main>
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
    </>
  )
}

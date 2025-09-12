import Box from '@mui/material/Box'
import { FormikProvider } from 'formik'

import { publicReportsIllustration } from 'assets/images'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { ModalReport } from 'modules/reporting/components'
import { TableReportsPublic } from 'modules/reports-public/components/TableReportsPublic/TableReportsPublic.component.tsx'
import { usePublicReports } from 'modules/reports-public/hooks/usePublicReports.ts'

export const ViewReportsPublic = () => {
  const { t } = useTranslations()

  const { formik, report, reports, handleReportViewClose, handleReportViewOpen, areFiltersSelected, hasEmptyPageState, isFetching, isReportViewOpen } = usePublicReports()

  return (
    <>
      <LayoutPublic.Header isPublic>
        <LayoutPublic.Header.Details description={t({ id: 'publicInterfaceViewDescription' })} title={t({ id: 'reports' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
        <FormikProvider value={formik}>
          {hasEmptyPageState ? (
            <EmptyStatePage
              asset={<Box alt={t({ id: 'noPublicReportsMessage' })} component="img" maxWidth="47.5rem" src={publicReportsIllustration} width="100%" />}
              hint={t({ id: 'noPublicReportsHint' }, { organisation: 'Cardano Foundation' })}
              message={t({ id: 'noPublicReportsMessage' })}
            />
          ) : (
            <TableReportsPublic data={reports} onViewOpen={handleReportViewOpen} areFiltersSelected={areFiltersSelected} isFetching={isFetching} />
          )}
        </FormikProvider>
      </LayoutPublic.Main>
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
    </>
  )
}

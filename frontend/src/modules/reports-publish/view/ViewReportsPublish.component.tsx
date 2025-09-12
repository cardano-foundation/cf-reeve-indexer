// TODO: have a call with Marco and present and agree upon data structure and types and endpoints and pagination and parameters and filters
// TODO: success snackbar
import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TabsReports } from 'libs/ui-kit/components/TabsReports/TabsReports.component.tsx'

export const ViewReportsPublish = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'reportsPublishViewDescription' })} title={t({ id: 'publish' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted>
        <TabsReports />
      </LayoutAuth.Main>
    </>
  )
}

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DataExplorerCardsMenu } from 'modules/data-explorer/sections/DataExplorerCardsMenu/DataExplorerCardsMenu.component.tsx'

export const ViewDataExplorer = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'dataExplorerViewDescription' })} title={t({ id: 'dataExplorerViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <DataExplorerCardsMenu />
      </LayoutAuth.Main>
    </>
  )
}

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DataExplorerCardsMenu } from 'modules/public-data-explorer/sections/DataExplorerCardsMenu/DataExplorerCardsMenu.component.tsx'

export const ViewPublicDataExplorer = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutPublic.Header isPublic>
        <LayoutPublic.Header.Details description={t({ id: 'publicDataExplorerViewDescription' })} title={t({ id: 'publicDataExplorerViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6}>
        <DataExplorerCardsMenu />
      </LayoutPublic.Main>
    </>
  )
}

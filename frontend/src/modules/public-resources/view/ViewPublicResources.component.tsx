import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ResourcesCardsMenu } from 'modules/public-resources/sections/ResourcesCardsMenu/ResourcesCardsMenu.component.tsx'

export const ViewPublicResources = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicResourcesViewDescription' })} title={t({ id: 'publicResourcesViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6}>
        <ResourcesCardsMenu />
      </LayoutPublic.Main>
    </>
  )
}

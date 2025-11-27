import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

import PublicResourcesGlossaryContent from '../sections/PublicResourcesGlossaryContent.component'

export const ViewPublicResourcesGlossary = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicGlossaryDescription' })} title={t({ id: 'publicGlossary' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6}>
        <PublicResourcesGlossaryContent />
      </LayoutPublic.Main>
    </>
  )
}

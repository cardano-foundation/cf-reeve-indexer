import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

import PublicResourcesUserGuideContent from '../sections/PublicResourcesUserGuideContent.component'

export const ViewPublicResourcesUserGuide = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutPublic.Header isPublic>
        <LayoutPublic.Header.Details description={t({ id: 'publicUserGuideDescription' })} title={t({ id: 'publicUserGuideViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={{ xs: 4, sm: 6 }} p={{ xs: 4, sm: 0 }}>
        <PublicResourcesUserGuideContent />
      </LayoutPublic.Main>
    </>
  )
}

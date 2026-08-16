import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ProjectsCardsMenu } from 'modules/public-projects/sections/ProjectsCardsMenu/ProjectsCardsMenu.component.tsx'

export const ViewPublicProjects = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'publicProjectsViewDescription' })} title={t({ id: 'publicProjectsViewTitle' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6}>
        <ProjectsCardsMenu />
      </LayoutPublic.Main>
    </>
  )
}

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { OrganizationCardsMenu } from 'modules/organization/sections/OrganizationCardsMenu/OrganizationCardsMenu.component.tsx'

export const ViewOrganization = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutAuth.Header flexDirection="column" justifyContent="center">
        <LayoutAuth.Header.Details description={t({ id: 'organizationViewDescription' })} title={t({ id: 'organizationViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <OrganizationCardsMenu />
      </LayoutAuth.Main>
    </>
  )
}

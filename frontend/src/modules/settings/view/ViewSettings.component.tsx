import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SettingsCardsMenu } from 'modules/settings/sections/SettingsCardsMenu/SettingsCardsMenu.component.tsx'

export const ViewSettings = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutAuth.Header flexDirection="column" justifyContent="center">
        <LayoutAuth.Header.Details description={t({ id: 'settingsViewDescription' })} title={t({ id: 'settingsViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <SettingsCardsMenu />
      </LayoutAuth.Main>
    </>
  )
}

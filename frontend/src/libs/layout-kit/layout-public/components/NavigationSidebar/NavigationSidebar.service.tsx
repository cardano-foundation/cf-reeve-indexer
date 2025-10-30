import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'

export const useNavigationRoutes = () => {
  const { t } = useTranslations()

  const RESOURCES_ROUTES = [
    { label: t({ id: 'publicGlossary' }), route: PATHS.PUBLIC_RESOURCES_GLOSSARY },
    { label: t({ id: 'publicUserGuide' }), route: PATHS.PUBLIC_RESOURCES_USERGUIDE }
  ]
  return { RESOURCES_ROUTES }
}

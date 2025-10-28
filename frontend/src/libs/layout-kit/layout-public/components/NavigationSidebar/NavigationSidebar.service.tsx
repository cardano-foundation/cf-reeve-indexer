import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'

export const useNavigationRoutes = () => {
  const { t } = useTranslations()

  const RESOURCES_ROUTES = [
    { label: t({ id: 'publicGlossary' }), route: PATHS.PUBLIC_RESOURCES_GLOSSARY },
    { label: t({ id: 'publicUserGuide' }), route: PATHS.PUBLIC_RESOURCES_USERGUIDE }
  ]

  const DATA_EXPLORER_ROUTES = [
    { label: t({ id: 'publicFinancialOverview' }), route: PATHS.PUBLIC_DATA_EXPLORER_FINANCIAL_OVERVIEW },
    { label: t({ id: 'publicAssetOverview' }), route: PATHS.PUBLIC_DATA_EXPLORER_ASSET_OVERVIEW }
  ]

  return { RESOURCES_ROUTES, DATA_EXPLORER_ROUTES }
}

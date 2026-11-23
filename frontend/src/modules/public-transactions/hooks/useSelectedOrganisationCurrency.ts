import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { formatCurrency } from 'modules/public-reports/utils/format'

export const useSelectedOrganisationCurrency = () => {
  const { organisations, selectedOrganisation } = useLayoutPublicContext()

  const currencyId = organisations.find((org) => org.id === selectedOrganisation)?.currency_id

  return currencyId ? formatCurrency(currencyId) : ''
}

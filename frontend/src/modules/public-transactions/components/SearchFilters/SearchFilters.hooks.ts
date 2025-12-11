import { useFormik, useFormikContext } from 'formik'
import { noop } from 'lodash'

import { useDatesRange } from 'hooks'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useGetOrganisationCostCentersModel } from 'libs/models/organisation-model/GetOrganisationCostCenters/GetOrganisationCostCenters.service'
import { useGetOrganisationCounterpartiesModel } from 'libs/models/organisation-model/GetOrganisationCounterparties/GetOrganisationCounterparties.service'
import { useGetOrganisationCounterpartyTypesModel } from 'libs/models/organisation-model/GetOrganisationCounterpartyTypes/GetOrganisationCounterpartyTypes.service'
import { useGetOrganisationCurrenciesModel } from 'libs/models/organisation-model/GetOrganisationCurrencies/GetOrganisationCurrencies.service'
import { useGetOrganisationDocumentNumbersModel } from 'libs/models/organisation-model/GetOrganisationDocumentNumbers/GetOrganisationDocumentNumbers.service'
import { useGetOrganisationEventsModel } from 'libs/models/organisation-model/GetOrganisationEvents/GetOrganisationEvents.service'
import { useGetOrganisationProjectsModel } from 'libs/models/organisation-model/GetOrganisationProjects/GetOrganisationsProjects.service'
import { useGetOrganisationTransactionNumbersModel } from 'libs/models/organisation-model/GetOrganisationTransactionNumbers/GetOrganisationTransactionNumbers.service'
import { useGetOrganisationTransactionTypesModel } from 'libs/models/organisation-model/GetOrganisationTransactionTypes/GetOrganisationTransactionTypes.service'
import { useGetOrganisationVatCodesModel } from 'libs/models/organisation-model/GetOrganisationVatCodes/GetOrganisationVatCodes.service'
import {
  getAllCostCenterOptions,
  getAllCounterpartyOptions,
  getAllCounterpartyTypeOptions,
  getAllCurrencyOptions,
  getAllDocumentNumberOptions,
  getAllEventOptions,
  getAllProjectOptions,
  getAllTransactionNumberOptions,
  getAllTransactionTypeOptions,
  getAllVatCodeOptions
} from 'libs/utils/formFieldOptions'

import { DEFAULT_SEARCH_FILTERS_VALUES } from './SearchFilters.consts'
import { SearchFiltersValues } from './SearchFilters.types'

export const useSearchFiltersOptions = () => {
  const { selectedOrganisation } = useLayoutPublicContext()

  const { costCenters } = useGetOrganisationCostCentersModel({ parameters: { organisationId: selectedOrganisation } })
  const { counterparties } = useGetOrganisationCounterpartiesModel({ parameters: { organisationId: selectedOrganisation } })
  const { counterpartyTypes } = useGetOrganisationCounterpartyTypesModel({ parameters: { organisationId: selectedOrganisation } })
  const { currencies } = useGetOrganisationCurrenciesModel({ parameters: { organisationId: selectedOrganisation } })
  const { documentNumbers } = useGetOrganisationDocumentNumbersModel({ parameters: { organisationId: selectedOrganisation } })
  const { events } = useGetOrganisationEventsModel({ parameters: { organisationId: selectedOrganisation } })
  const { projects } = useGetOrganisationProjectsModel({ parameters: { organisationId: selectedOrganisation } })
  const { transactionNumbers } = useGetOrganisationTransactionNumbersModel({ parameters: { organisationId: selectedOrganisation } })
  const { transactionTypes } = useGetOrganisationTransactionTypesModel({ parameters: { organisationId: selectedOrganisation } })
  const { vatCodes } = useGetOrganisationVatCodesModel({ parameters: { organisationId: selectedOrganisation } })

  const costCenterOptions = getAllCostCenterOptions(costCenters)
  const counterpartyOptions = getAllCounterpartyOptions(counterparties)
  const counterpartyTypeOptions = getAllCounterpartyTypeOptions(counterpartyTypes)
  const currencyOptions = getAllCurrencyOptions(currencies)
  const documentNumberOptions = getAllDocumentNumberOptions(documentNumbers)
  const eventOptions = getAllEventOptions(events)
  const projectOptions = getAllProjectOptions(projects)
  const transactionNumberOptions = getAllTransactionNumberOptions(transactionNumbers)
  const transactionTypeOptions = getAllTransactionTypeOptions(transactionTypes)
  const vatCodeOptions = getAllVatCodeOptions(vatCodes)

  return {
    costCenterOptions,
    counterpartyOptions,
    counterpartyTypeOptions,
    currencyOptions,
    documentNumberOptions,
    eventOptions,
    projectOptions,
    transactionNumberOptions,
    transactionTypeOptions,
    vatCodeOptions
  }
}

export const useSearchDrawerFiltersForm = () => {
  const filters = useFormik({
    initialValues: DEFAULT_SEARCH_FILTERS_VALUES,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { filters }
}

export const useSearchFilters = () => {
  const { values } = useFormikContext<SearchFiltersValues>()

  const {
    costCenterOptions,
    counterpartyOptions,
    counterpartyTypeOptions,
    currencyOptions,
    documentNumberOptions,
    eventOptions,
    projectOptions,
    transactionNumberOptions,
    transactionTypeOptions,
    vatCodeOptions
  } = useSearchFiltersOptions()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate } = useDatesRange()

  return {
    values,
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    options: {
      costCenterOptions,
      counterpartyOptions,
      counterpartyTypeOptions,
      currencyOptions,
      documentNumberOptions,
      eventOptions,
      projectOptions,
      transactionNumberOptions,
      transactionTypeOptions,
      vatCodeOptions
    }
  }
}

import { useFormik, useFormikContext } from 'formik'
import { noop } from 'lodash'

import { useDatesRange } from 'hooks'
// import { FilterType } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types'
// import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
// import { useGetCostCentersModel } from 'libs/models/cost-centers/GetCostCentersModel.service'
// import { useGetEventCodesModel } from 'libs/models/event-codes/GetEventCodes.service'
// import { useGetCurrenciesModel } from 'libs/models/organisation-model/GetCurrencies/GetCurrencies.service'
// import { useGetOrganisationProjectsModel } from 'libs/models/organisation-model/GetOrganisationProjects/GetOrganisationProjectsModel.service'
// import { useGetFilterOptionsModel } from 'libs/models/transactions-model/GetFilterOptions/GetFilterOptionsModel.service'
// import { useGetVatCodesModel } from 'libs/models/vat-codes/GetVatCodesModel.service'
// import {
//   getAllCostCenterOptions,
//   getAllCounterpartyOptions,
//   getAllCounterpartyTypeOptions,
//   getAllCurrenciesOptions,
//   getAllDocumentNumbersOptions,
//   getAllEventOptions,
//   getAllProjectOptions,
//   getAllTransactionNumbersOptions,
//   getAllTransactionTypeOptions,
//   getAllVatCodesOptions
// } from 'libs/utils/formFieldOptions'

import { DEFAULT_SEARCH_FILTERS_VALUES } from './SearchFilters.consts'
import { SearchFiltersValues } from './SearchFilters.types'

export const useSearchFiltersOptions = () => {
  // const selectedOrganisation = useSelectedOrganisation()

  // const { filterOptions } = useGetFilterOptionsModel({
  //   parameters: {
  //     organisationId: selectedOrganisation,
  //     filterOptions: [FilterType.COUNTER_PARTY_TYPE, FilterType.COUNTER_PARTY, FilterType.DOCUMENT_NUMBERS, FilterType.TRANSACTION_NUMBERS, FilterType.TRANSACTION_TYPES]
  //   }
  // })
  // const { costCenters } = useGetCostCentersModel(selectedOrganisation)
  // const { currencies } = useGetCurrenciesModel(selectedOrganisation)
  // const { eventCodes } = useGetEventCodesModel(selectedOrganisation)
  // const { organisationProjects } = useGetOrganisationProjectsModel({ id: selectedOrganisation })
  // const { vatCodes } = useGetVatCodesModel(selectedOrganisation)

  // const costCenterOptions = getAllCostCenterOptions(costCenters)
  // const counterpartyOptions = getAllCounterpartyOptions(filterOptions?.COUNTER_PARTY)
  // const counterpartyTypeOptions = getAllCounterpartyTypeOptions(filterOptions?.COUNTER_PARTY_TYPE)
  // const currencyOptions = getAllCurrenciesOptions(currencies)
  // const documentNumbersOptions = getAllDocumentNumbersOptions(filterOptions?.DOCUMENT_NUMBERS)
  // const eventOptions = getAllEventOptions(eventCodes)
  // const projectOptions = getAllProjectOptions(organisationProjects)
  // const transactionNumbersOptions = getAllTransactionNumbersOptions(filterOptions?.TRANSACTION_NUMBERS)
  // const transactionTypeOptions = getAllTransactionTypeOptions(filterOptions?.TRANSACTION_TYPES)
  // const vatCodesOptions = getAllVatCodesOptions(vatCodes)

  return {
    costCenterOptions: [],
    counterpartyOptions: [],
    counterpartyTypeOptions: [],
    currencyOptions: [],
    documentNumbersOptions: [],
    eventOptions: [],
    projectOptions: [],
    transactionNumbersOptions: [],
    transactionTypeOptions: [],
    vatCodesOptions: []
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
    documentNumbersOptions,
    eventOptions,
    projectOptions,
    transactionNumbersOptions,
    transactionTypeOptions,
    vatCodesOptions
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
      documentNumbersOptions,
      eventOptions,
      projectOptions,
      transactionNumbersOptions,
      transactionTypeOptions,
      vatCodesOptions
    }
  }
}

import { useMemo } from 'react'

import type { AutocompleteOption } from 'features/mui/base'
import { FilterType } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGetChartOfAccountsModel } from 'libs/models/chart-of-accounts/GetChartOfAccountsModel.service.ts'
import { useGetCostCentersModel } from 'libs/models/cost-centers/GetCostCentersModel.service.ts'
import { useGetEventCodesModel } from 'libs/models/event-codes/GetEventCodes.service.ts'
import { useGetCurrenciesModel } from 'libs/models/organisation-model/GetCurrencies/GetCurrencies.service.ts'
import { useGetOrganisationProjectsModel } from 'libs/models/organisation-model/GetOrganisationProjects/GetOrganisationProjectsModel.service.ts'
import { useGetFilterOptionsModel } from 'libs/models/transactions-model/GetFilterOptions/GetFilterOptionsModel.service.ts'
import { useGetVatCodesModel } from 'libs/models/vat-codes/GetVatCodesModel.service.ts'

export const useBatchDetailsFilterOptions = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { filterOptions, isFetching } = useGetFilterOptionsModel({
    parameters: {
      organisationId: selectedOrganisation,
      filterOptions: [FilterType.DOCUMENT_NUMBERS, FilterType.TRANSACTION_TYPES, FilterType.COUNTER_PARTY_TYPE, FilterType.COUNTER_PARTY]
    }
  })

  const { currencies } = useGetCurrenciesModel(selectedOrganisation)

  const { vatCodes } = useGetVatCodesModel(selectedOrganisation)

  const { costCenters } = useGetCostCentersModel(selectedOrganisation)

  const { organisationProjects } = useGetOrganisationProjectsModel({ id: selectedOrganisation })

  const { chartOfAccounts } = useGetChartOfAccountsModel(selectedOrganisation)

  const { eventCodes } = useGetEventCodesModel(selectedOrganisation)

  type Option = {
    name: string
    customerCode: string
    description: string
  }

  const documentNumbersOptions = useMemo(() => {
    if (!filterOptions) return []

    return (
      (filterOptions[FilterType.DOCUMENT_NUMBERS] as unknown as Option[] | undefined)
        ?.filter((item): item is Option => Boolean(item?.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((option) => ({
          label: option.name,
          value: option.name
        })) ?? []
    )
  }, [filterOptions])

  const transactionTypeOptions = useMemo(() => {
    if (!filterOptions) return []

    return (
      (filterOptions[FilterType.TRANSACTION_TYPES] as unknown as Option[] | undefined)
        ?.filter((item): item is Option => Boolean(item?.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((option) => ({
          label: option.name,
          value: option.name
        })) ?? []
    )
  }, [filterOptions])

  const counterPartyTypeOptions = useMemo(() => {
    if (!filterOptions) return []

    return (
      (filterOptions[FilterType.COUNTER_PARTY_TYPE] as unknown as Option[] | undefined)
        ?.filter((item): item is Option => Boolean(item?.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((option) => ({
          label: option.name,
          value: option.name
        })) ?? []
    )
  }, [filterOptions])

  const counterPartyOptions = useMemo(() => {
    if (!filterOptions) return []

    return (
      (filterOptions[FilterType.COUNTER_PARTY] as unknown as Option[] | undefined)
        ?.filter((item): item is Option => Boolean(item?.customerCode))
        .sort((a, b) => a.customerCode.localeCompare(b.customerCode))
        .map((option) => ({
          label: option.customerCode,
          value: option.customerCode
        })) ?? []
    )
  }, [filterOptions])

  const currenciesOptions = currencies
    ? currencies
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { customerCode }) => {
          return [...acc, { label: customerCode, value: customerCode }]
        }, [])
    : []

  const vatCodesOptions = vatCodes
    ? vatCodes
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { customerCode }) => {
          return [...acc, { label: customerCode, value: customerCode }]
        }, [])
    : []

  const costCenterParentsOptions = costCenters
    ? costCenters
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { customerCode, name }) => {
          return [...acc, { description: name, label: customerCode, value: customerCode }]
        }, [])
    : []

  const costCenterChildrenOptions = costCenters
    ? costCenters
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { children }) => {
          return [...acc, ...(children ?? []).map(({ customerCode, name }) => ({ description: name, label: customerCode, value: customerCode }))]
        }, [])
    : []

  const projectParentsOptions = organisationProjects
    ? organisationProjects
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { customerCode, name }) => {
          return [...acc, { description: name, label: customerCode, value: customerCode }]
        }, [])
    : []

  const projectChildrenOptions = organisationProjects
    ? organisationProjects
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { children }) => {
          return [...acc, ...(children ?? []).map(({ customerCode, name }) => ({ description: name, label: customerCode, value: customerCode }))]
        }, [])
    : []

  const accountsOptions = chartOfAccounts
    ? chartOfAccounts
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { customerCode, name }) => {
          return [...acc, { description: name, label: customerCode, value: customerCode }]
        }, [])
    : []

  const eventsOptions = eventCodes
    ? eventCodes
        .filter(Boolean)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .reduce<AutocompleteOption[]>((acc, { customerCode, description }) => {
          return [...acc, { description, label: customerCode, value: customerCode }]
        }, [])
    : []

  return {
    accountsOptions,
    costCenterParentsOptions,
    costCenterChildrenOptions,
    counterPartyOptions,
    counterPartyTypeOptions,
    currenciesOptions,
    documentNumbersOptions,
    eventsOptions,
    projectParentsOptions,
    projectChildrenOptions,
    transactionTypeOptions,
    vatCodesOptions,
    isFetching
  }
}

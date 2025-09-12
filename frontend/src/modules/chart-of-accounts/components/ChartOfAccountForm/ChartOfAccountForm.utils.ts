import { flatten } from 'lodash'

import { ChartOfAccount } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types'
import { OrganisationApiResponse, OrganisationChartTypesResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

export const getCurrencyOptions = (currencies?: OrganisationApiResponse['organisationCurrencies'] | null) => {
  return currencies
    ? currencies.map<SelectOption>((currency) => ({
        name: currency,
        value: currency
      }))
    : []
}

export const getParentCodeOptions = (chartOfAccounts: ChartOfAccount[], currentCode: string | null) => {
  const uniqueCodes = Array.from(new Set(chartOfAccounts.map(({ customerCode }) => customerCode))).map((customerCode) => ({ name: customerCode }))

  return uniqueCodes
    ? uniqueCodes
        .map<SelectOption>(({ name: parentCode }) => ({
          name: `${parentCode} - ${chartOfAccounts.find((code) => code.customerCode === parentCode)?.name}`,
          value: parentCode
        }))
        .filter((parentCode) => parentCode.value !== currentCode)
        .sort((a, b) => a.name.localeCompare(b.name))
    : []
}

export const getReferenceCodeOptions = (referenceCodes: { name: string; value: string }[] | null) => {
  return referenceCodes
    ? referenceCodes
        .map<SelectOption>(({ value: referenceCode, name: referenceCodeName }) => ({
          name: `${referenceCode} - ${referenceCodeName}`,
          value: referenceCode
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : []
}

export const getSubtypeOptions = (accountTypes: OrganisationChartTypesResponse[] | null, selectedType: number, selectedSubType: number | null = null) => {
  const types = accountTypes?.find((type) => {
    if (type.id === selectedType) {
      return type.subType
    }
  })

  if (!types) {
    return []
  }

  return types?.subType
    .map(({ id, name }) => ({
      name: intl.formatMessage({ id: name }),
      value: id
    }))
    .filter((subtype) => (!selectedSubType ? true : subtype.value === selectedSubType))
}

export const getAllSubTypes = (accountTypes: OrganisationChartTypesResponse[] | null) => {
  return flatten(
    accountTypes?.map((account) =>
      account.subType.map(({ id, name }) => ({
        name: intl.formatMessage({ id: name }),
        value: id
      }))
    )
  )
}

export const getTypeOptions = (accountTypes: OrganisationChartTypesResponse[] | null) => {
  return accountTypes
    ? accountTypes.map<SelectOption>(({ name, id }) => ({
        name: intl.formatMessage({ id: name }),
        value: id
      }))
    : []
}

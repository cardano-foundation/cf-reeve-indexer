import {
  OrganisationChartTypesApiResponse200,
  OrganisationCostCentersApiResponse200,
  OrganisationProjectsApiResponse200
} from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { AutocompleteMultipleOption } from 'libs/ui-kit/components/InputAutocompleteMultiple/InputAutocompleteMultiple.component.tsx'

export const getAllAccountTypeOptions = (chartTypes: OrganisationChartTypesApiResponse200 | null) => {
  return chartTypes
    ? chartTypes.map<AutocompleteMultipleOption>(({ name: accountType }) => ({
        name: intl.formatMessage({ id: accountType }),
        value: accountType
      }))
    : []
}

export const getAllAccountSubtypeOptions = (chartTypes: OrganisationChartTypesApiResponse200 | null) => {
  return chartTypes
    ? chartTypes.reduce<AutocompleteMultipleOption[]>((acc, { name: accountType, subType }) => {
        subType
          .sort((current, next) => current.name.localeCompare(next.name))
          .forEach(({ name: accountSubtype }) => {
            acc.push({
              name: intl.formatMessage({ id: accountSubtype }),
              value: accountSubtype,
              group: intl.formatMessage({ id: accountType })
            })
          })

        return acc
      }, [])
    : []
}

export const getAllAccountCodeOptions = (chartTypes: OrganisationChartTypesApiResponse200 | null) => {
  return chartTypes
    ? chartTypes
        .reduce<AutocompleteMultipleOption[]>((acc, { subType }) => {
          subType.forEach(({ name: accountSubtype, chartOfAccounts }) => {
            if (chartOfAccounts) {
              chartOfAccounts
                .sort((current, next) => current.name.localeCompare(next.name))
                .forEach(({ customerCode, name }) => {
                  acc.push({
                    name: `${customerCode} - ${name}`,
                    value: customerCode,
                    group: intl.formatMessage({ id: accountSubtype })
                  })
                })
            }
          })

          return acc
        }, [])
        .sort((current, next) => (current.group ?? '').localeCompare(next.group ?? ''))
    : []
}

export const getAllCostCenterOptions = (costCenters: OrganisationCostCentersApiResponse200 | null) => {
  return costCenters
    ? costCenters.map<AutocompleteMultipleOption>(({ customerCode, name: costCenter }) => ({
        name: `${customerCode} ${costCenter}`,
        value: customerCode
      }))
    : []
}

export const getAllProjectOptions = (projects: OrganisationProjectsApiResponse200 | null) => {
  return projects
    ? projects.map<AutocompleteMultipleOption>(({ customerCode, name: project }) => ({
        name: project,
        value: customerCode
      }))
    : []
}

export const getAccountSubtypesForAccountTypes = (chartTypes: OrganisationChartTypesApiResponse200 | null, accountTypes: string[]) => {
  return chartTypes
    ? chartTypes.reduce<AutocompleteMultipleOption[]>((acc, { name: accountType, subType }) => {
        if (accountTypes.includes(accountType)) {
          subType
            .sort((current, next) => current.name.localeCompare(next.name))
            .forEach(({ name: accountSubtype }) => {
              acc.push({ name: intl.formatMessage({ id: accountSubtype }), value: accountSubtype, group: intl.formatMessage({ id: accountType }) })
            })
        }

        return acc
      }, [])
    : []
}

export const getAccountCodesForAccountTypes = (chartTypes: OrganisationChartTypesApiResponse200 | null, accountTypes: string[]) => {
  return chartTypes
    ? chartTypes
        .reduce<AutocompleteMultipleOption[]>((acc, { name: accountType, subType }) => {
          if (accountTypes.includes(accountType)) {
            subType.forEach(({ name: accountSubtype, chartOfAccounts }) => {
              if (chartOfAccounts) {
                chartOfAccounts
                  .sort((current, next) => current.name.localeCompare(next.name))
                  .forEach(({ customerCode, name }) => {
                    acc.push({ name: `${customerCode} - ${name}`, value: customerCode, group: intl.formatMessage({ id: accountSubtype }) })
                  })
              }
            })
          }

          return acc
        }, [])
        .sort((current, next) => (current.group ?? '').localeCompare(next.group ?? ''))
    : []
}

export const getAccountCodesForAccountTypesAndSubtypes = (chartTypes: OrganisationChartTypesApiResponse200 | null, accountTypes: string[], accountSubtypes: string[]) => {
  return chartTypes
    ? chartTypes
        .reduce<AutocompleteMultipleOption[]>((acc, { name: accountType, subType }) => {
          if (accountTypes.includes(accountType)) {
            subType.forEach(({ name: accountSubtype, chartOfAccounts }) => {
              if (accountSubtypes.includes(accountSubtype)) {
                chartOfAccounts
                  ?.sort((current, next) => current.name.localeCompare(next.name))
                  .forEach(({ customerCode, name }) => {
                    acc.push({ name: `${customerCode} - ${name}`, value: customerCode, group: intl.formatMessage({ id: accountSubtype }) })
                  })
              }
            })
          }

          return acc
        }, [])
        .sort((current, next) => (current.group ?? '').localeCompare(next.group ?? ''))
    : []
}

export const findAccountTypesForAccountSubtypes = (chartTypes: OrganisationChartTypesApiResponse200 | null, accountSubtypes: string[]) => {
  return chartTypes
    ? chartTypes.reduce<string[]>((acc, { name: accountType, subType }) => {
        const subtypes = subType.map(({ name }) => name)

        if (subtypes.some((accountSubtype) => accountSubtypes.includes(accountSubtype))) {
          acc.push(accountType)
        }

        return acc
      }, [])
    : []
}

export const findAccountSubtypesAndTypesforAccountCodes = (chartTypes: OrganisationChartTypesApiResponse200 | null, accountCodes: string[]) => {
  const accountTypes: string[] = []
  const accountSubtypes: string[] = []

  chartTypes?.forEach(({ name: accountType, subType }) => {
    subType.forEach(({ name: accountSubtype, chartOfAccounts }) => {
      if (chartOfAccounts?.some(({ customerCode }) => accountCodes.includes(customerCode))) {
        if (!accountTypes.includes(accountType)) {
          accountTypes.push(accountType)
        }

        if (!accountSubtypes.includes(accountSubtype)) {
          accountSubtypes.push(accountSubtype)
        }
      }
    })
  })

  return { accountTypes, accountSubtypes }
}

import dayjs from 'dayjs'

import { type AutocompleteOption } from 'features/mui/base'
import {
  OrganisationCostCenterEntity,
  OrganisationCounterpartyEntity,
  OrganisationCounterpartyTypeEntity,
  OrganisationCurrencyEntity,
  OrganisationDocumentNumberEntity,
  OrganisationEventEntity,
  OrganisationProjectEntity,
  OrganisationTransactionNumberEntity,
  OrganisationTransactionTypeEntity,
  OrganisationVatCodeEntity
} from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'
import { ReportMonth, ReportQuarter, ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { intl } from 'libs/translations/utils/intl'

const BASE_YEAR = '2023'

const getYears = (periodFrom: string): number[] => {
  if (!periodFrom) return []

  const years = []
  const currentYear = dayjs().year()

  for (let year = currentYear; year >= Number(periodFrom); year--) {
    years.push(year)
  }

  return years
}

export const getAllCostCenterOptions = (costCenters: OrganisationCostCenterEntity[] | null | undefined) => {
  return costCenters
    ? costCenters
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllCounterpartyOptions = (counterparties: OrganisationCounterpartyEntity[] | null | undefined) => {
  return counterparties
    ? counterparties
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllCounterpartyTypeOptions = (counterpartyTypes: OrganisationCounterpartyTypeEntity[] | null | undefined) => {
  return counterpartyTypes
    ? counterpartyTypes
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllCurrencyOptions = (currencies: OrganisationCurrencyEntity[] | null | undefined) => {
  return currencies
    ? currencies
        .filter((option) => Boolean(option) && Object.keys(option).length > 0)
        .sort((current, next) => current.customerCode.localeCompare(next.customerCode))
        .map<AutocompleteOption>(({ customerCode }) => {
          return { label: customerCode, value: customerCode }
        })
    : []
}

export const getAllDocumentNumberOptions = (documentNumbers: OrganisationDocumentNumberEntity[] | null | undefined) => {
  return documentNumbers
    ? documentNumbers
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllEventOptions = (events: OrganisationEventEntity[] | null | undefined) => {
  return events
    ? events
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllProjectOptions = (projects: OrganisationProjectEntity[] | null | undefined) => {
  return projects
    ? projects
        .filter((option) => Boolean(option) && Object.keys(option).length > 0)
        .sort((current, next) => current.projectCustCode.localeCompare(next.projectCustCode))
        .map<AutocompleteOption>(({ projectCustCode }) => {
          return { label: projectCustCode, value: projectCustCode }
        })
    : []
}

export const getAllReportPeriodOptions = (periodFrom: string = BASE_YEAR) => {
  const years = getYears(periodFrom)
  const quarters = Object.values(ReportQuarter)
  const months = Object.values(ReportMonth)

  return years.flatMap<AutocompleteOption>((year) => {
    const yearOption = {
      label: intl.formatMessage({ id: 'reportPeriod' }, { year, period: intl.formatMessage({ id: 'fullYear' }) }),
      value: `${year} FY`
    }

    const quarterOptions = quarters.map<AutocompleteOption>((quarter, index) => ({
      label: intl.formatMessage({ id: 'reportPeriod' }, { year, period: intl.formatMessage({ id: 'quarterPrefix' }, { index: index + 1 }) }),
      value: `${year} ${quarter}`
    }))

    const monthOptions = months.map<AutocompleteOption>((month, index) => {
      const currentMonth = index < 9 ? `0${index + 1}` : `${index + 1}`
      const date = new Date(`${year}-${currentMonth}-01`)

      return {
        label: intl.formatMessage({ id: 'reportPeriod' }, { year, period: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date) }),
        value: `${year} ${month.charAt(0)?.toUpperCase()}${month.slice(1).toLowerCase()}`
      }
    })

    return [yearOption, ...quarterOptions.flatMap<AutocompleteOption>((option, index) => [option, ...monthOptions.slice(index * 3, (index + 1) * 3)])]
  })
}

export const getAllReportTypeOptions = () => {
  return Object.keys(ReportType)
    .sort((current, next) => current.localeCompare(next))
    .map<AutocompleteOption>((type) => ({ label: intl.formatMessage({ id: type }), value: type }))
}

export const getAllTransactionNumberOptions = (transactionNumbers: OrganisationTransactionNumberEntity[] | null | undefined) => {
  return transactionNumbers
    ? transactionNumbers
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllTransactionTypeOptions = (transactionTypes: OrganisationTransactionTypeEntity[] | null | undefined) => {
  return transactionTypes
    ? transactionTypes
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

export const getAllVatCodeOptions = (vatCodes: OrganisationVatCodeEntity[] | null | undefined) => {
  return vatCodes
    ? vatCodes
        .sort((current, next) => current.localeCompare(next))
        .map<AutocompleteOption>((option) => {
          return { label: option, value: option }
        })
    : []
}

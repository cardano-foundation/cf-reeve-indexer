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

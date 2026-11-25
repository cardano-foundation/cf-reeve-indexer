import { type AutocompleteOption } from 'features/mui/base'
import { OrganisationAccountingRegimeEntity } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'
import { intl } from 'libs/translations/utils/intl'
import { REPORT_STANDARD_NOT_STATED_VALUE } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.consts'

export const formatToFloatReadyFormat = (value: string) => (value && !isNaN(parseFloat(value)) ? value : '0').replace(/,/g, '')

export const sumTotals = (values: string[]) => values.reduce((acc, value) => acc + parseFloat(formatToFloatReadyFormat(value)), 0)

export const formatCurrency = (value: string) => {
  const startIndex = value.indexOf(':')

  return value.slice(startIndex + 1, startIndex + 4)
}

export const getReportStandard = (accountingRegime: string | null) => {
  const regime = accountingRegime?.trim()

  return !regime || regime.toLowerCase() === 'not applicable' ? null : regime
}

export const getReportStandardOptions = (accountingRegimes: OrganisationAccountingRegimeEntity[] | null | undefined) => {
  const standards = new Set((accountingRegimes ?? []).map((accountingRegime) => getReportStandard(accountingRegime) ?? REPORT_STANDARD_NOT_STATED_VALUE))

  return [...standards]
    .sort((current, next) => current.localeCompare(next))
    .map<AutocompleteOption>((standard) => ({
      label: standard === REPORT_STANDARD_NOT_STATED_VALUE ? intl.formatMessage({ id: 'unspecified' }) : intl.formatMessage({ id: standard, defaultMessage: standard }),
      value: standard
    }))
}

export const snakeToNormal = (input: string): string => {
  if (!input) return ''

  return input
    .split('_') // split into words
    .map((word, index) => {
      const lower = word.toLowerCase()
      // Capitalize the first word, keep others lowercase
      return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower
    })
    .join(' ')
}

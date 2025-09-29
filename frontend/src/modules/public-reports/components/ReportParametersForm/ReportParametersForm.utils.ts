import dayjs from 'dayjs'

import { CurrencyType, ReportMonth, ReportQuarter, ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'
import { intl } from 'libs/translations/utils/intl'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { theme } from 'libs/ui-kit/theme/theme.ts'

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

export const getReportTypeOptions = (reportType: ReportType[] = []): SelectOption[] => reportType.map((type) => ({ name: intl.formatMessage({ id: type }), value: type }))

export const getReportPeriodOptions = (periodFrom: string = BASE_YEAR): SelectOption[] => {
  const years = getYears(periodFrom)
  const quarters = Object.values(ReportQuarter)
  const months = Object.values(ReportMonth)

  return years.flatMap((year) => {
    const yearOption = {
      name: intl.formatMessage({ id: 'reportPeriod' }, { year, period: intl.formatMessage({ id: 'fullYear' }) }),
      value: `${year} FY`
    }

    const quarterOptions = quarters.map((quarter, index) => ({
      name: intl.formatMessage({ id: 'reportPeriod' }, { year, period: intl.formatMessage({ id: 'quarterPrefix' }, { index: index + 1 }) }),
      value: `${year} ${quarter}`,
      sx: { padding: theme.spacing(0, 2) }
    }))

    const monthOptions = months.map((month, index) => {
      const currentMonth = index < 9 ? `0${index + 1}` : `${index + 1}`
      const date = new Date(`${year}-${currentMonth}-01`)

      return {
        name: intl.formatMessage({ id: 'reportPeriod' }, { year, period: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date) }),
        value: `${year} ${month.at(0)?.toUpperCase()}${month.slice(1).toLowerCase()}`,
        sx: { padding: theme.spacing(0, 4) }
      }
    })

    return [yearOption, ...quarterOptions.flatMap((option, index) => [option, ...monthOptions.slice(index * 3, (index + 1) * 3)])]
  })
}

export const getReportCurrencyOptions = (currencyType: CurrencyType = {}): SelectOption[] =>
  Object.entries(currencyType).map(([isoFormat, symbol]) => ({ name: symbol, value: isoFormat }))

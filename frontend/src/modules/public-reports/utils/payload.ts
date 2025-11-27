import dayjs from 'dayjs'

import { GetPublicReportsRequestBody, IntervalType, ReportMonth, ReportQuarter } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'
import { ReportsFiltersValues } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.types'
import { ReportsQuickFiltersValues } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.types'

const getReportPeriodPayload = (periods: string[]) => {
  const yearAndTimeFramePeriods = periods.map((period) => period.split(/\s/g))

  return yearAndTimeFramePeriods.reduce(
    (acc, [year, timeFrame]) => {
      if (Object.values(ReportMonth).includes(timeFrame.toUpperCase() as ReportMonth)) {
        acc.intervalType.push(IntervalType.MONTH)
        acc.period.push(dayjs(new Date(`${year} ${timeFrame}`)).month() + 1)
        acc.year.push(Number(year))
      }

      if (Object.values(ReportQuarter).includes(timeFrame as ReportQuarter)) {
        acc.intervalType.push(IntervalType.QUARTER)
        acc.period.push(Number(timeFrame.slice(1)))
        acc.year.push(Number(year))
      }

      if (timeFrame === 'FY') {
        acc.intervalType.push(IntervalType.YEAR)
        acc.period.push(1)
        acc.year.push(Number(year))
      }

      return acc
    },
    { intervalType: [] as IntervalType[], period: [] as number[], year: [] as number[] }
  )
}

export const getReportPeriod = (intervalType: IntervalType, period: number, year: number) => {
  if (intervalType === IntervalType.MONTH) {
    const timeFrame = Object.values(ReportMonth)
      .find((_, index) => index === period - 1)
      ?.toLowerCase()
    const month = `${timeFrame?.charAt(0).toUpperCase()}${timeFrame?.slice(1)}`

    return `${year} ${month}`
  }

  if (intervalType === IntervalType.QUARTER) {
    const quarter = Object.values(ReportQuarter).find((_, index) => index === period - 1)

    return `${year} ${quarter}`
  }

  return `${year} FY`
}

export const mapSearchFiltersToRequestBody = (values: ReportsFiltersValues & ReportsQuickFiltersValues): Omit<GetPublicReportsRequestBody, 'organisationId'> => ({
  blockChainHash: values.search ? values.search : undefined,
  reportType: values.report.length ? values.report : undefined,
  ...(values.period.length ? getReportPeriodPayload(values.period) : { intervalType: undefined, period: undefined, year: undefined })
})

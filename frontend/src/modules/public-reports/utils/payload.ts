import dayjs from 'dayjs'

import { GetPublicReportsRequestBody, IntervalType, ReportMonth, ReportQuarter } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'
import { REPORT_STANDARD_NOT_STATED_VALUE } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.consts'
import { ReportsFiltersValues } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.types'
import { ReportsQuickFiltersValues } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.types'

const getReportStandardPayload = (standards: string[]) => {
  const accountingRegime = standards.filter((standard) => standard !== REPORT_STANDARD_NOT_STATED_VALUE)

  return {
    accountingRegime: accountingRegime.length ? accountingRegime : undefined,
    accountingRegimeNotStated: standards.includes(REPORT_STANDARD_NOT_STATED_VALUE) || undefined
  }
}

const getReportPeriodKeys = (periods: string[]) => {
  const yearAndTimeFramePeriods = periods.map((period) => period.split(/\s/g))

  return yearAndTimeFramePeriods.reduce<string[]>((acc, [year, timeFrame]) => {
    if (Object.values(ReportMonth).includes(timeFrame.toUpperCase() as ReportMonth)) {
      acc.push(`${IntervalType.MONTH}-${year}-${dayjs(new Date(`${year} ${timeFrame}`)).month() + 1}`)
    }

    if (Object.values(ReportQuarter).includes(timeFrame as ReportQuarter)) {
      acc.push(`${IntervalType.QUARTER}-${year}-${Number(timeFrame.slice(1))}`)
    }

    if (timeFrame === 'FY') {
      acc.push(`${IntervalType.YEAR}-${year}-1`)
    }

    return acc
  }, [])
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
  ...getReportStandardPayload(values.standard),
  attestedOnly: values.attestedOnly || undefined,
  periodKeys: values.period.length ? getReportPeriodKeys(values.period) : undefined
})

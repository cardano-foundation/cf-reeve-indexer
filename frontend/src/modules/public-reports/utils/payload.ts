import dayjs from 'dayjs'

import { IntervalType, ReportMonth, ReportQuarter } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'

export const getSearchReportPayload = (period: string) => {
  const [year, timeFrame] = period.split(/\s/g)

  if (Object.values(ReportMonth).includes(timeFrame.toUpperCase() as ReportMonth)) {
    return { intervalType: IntervalType.MONTH, period: dayjs(new Date(period)).month() + 1, year: Number(year) }
  }

  if (Object.values(ReportQuarter).includes(timeFrame as ReportQuarter)) {
    return { intervalType: IntervalType.QUARTER, period: Number(period.slice(period.length - 1)), year: Number(year) }
  }

  return { intervalType: IntervalType.YEAR, period: 1, year: Number(year) }
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

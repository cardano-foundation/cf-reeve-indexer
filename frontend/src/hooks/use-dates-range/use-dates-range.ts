import dayjs, { type Dayjs } from 'dayjs'

import { DEFUALT_MIN_DATE } from 'libs/const/dates.ts'

interface DatesRange {
  predefinedDateFrom?: string | null
  predefinedDateTo?: string | null
}

export const useDatesRange = ({ predefinedDateFrom, predefinedDateTo }: DatesRange = {}) => {
  const dateFrom = predefinedDateFrom ? dayjs(predefinedDateFrom, 'YYYY-MM-DD') : null
  const dateTo = predefinedDateTo ? dayjs(predefinedDateTo, 'YYYY-MM-DD') : null

  const getMaxDate = (date: Dayjs | null) => {
    return date ? dayjs(date) : dayjs()
  }

  const getMinDate = (date: Dayjs | null) => {
    return date ? dayjs(date) : dayjs(DEFUALT_MIN_DATE)
  }

  return {
    dateFromMinDate: getMinDate(dateFrom),
    dateFromMaxDate: getMaxDate(dateTo),
    dateToMinDate: getMinDate(dateFrom),
    dateToMaxDate: getMaxDate(dateTo)
  }
}

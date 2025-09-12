import dayjs from 'dayjs'

import { intl } from 'libs/translations/utils/intl.ts'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

const BASE_YEAR = '2023'

const getYears = (periodFrom: string): number[] => {
  if (!periodFrom) return []

  const years = []
  const currentYear = dayjs().year()

  for (let year = currentYear - 1; year >= Number(periodFrom); year--) {
    years.push(year)
  }

  return years
}

export const getReportPeriodOptions = (periodFrom: string = BASE_YEAR): SelectOption[] => {
  const years = getYears(periodFrom)

  return years.flatMap((year) => {
    const yearOption = {
      name: intl.formatMessage({ id: 'reportPeriod' }, { year, period: intl.formatMessage({ id: 'fullYear' }) }),
      value: `${year} FY`
    }

    return [yearOption]
  })
}

import { renderHook } from '@testing-library/react'
import dayjs from 'dayjs'

import { useDatesRange } from 'hooks/use-dates-range/use-dates-range'
import { DEFUALT_MIN_DATE } from 'libs/const/dates.ts'

const dateFrom = new Date('2023-11-01').toISOString()
const dateTo = new Date('2024-01-24').toISOString()
const today = new Date('2024-01-25').toISOString()

describe('useDatesRange', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(today) })
  })

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useDatesRange())

    expect(result.current.dateFromMinDate).toStrictEqual(dayjs(DEFUALT_MIN_DATE))
    expect(result.current.dateFromMaxDate).toStrictEqual(dayjs(today))
    expect(result.current.dateToMinDate).toStrictEqual(dayjs(DEFUALT_MIN_DATE))
    expect(result.current.dateToMaxDate).toStrictEqual(dayjs(today))
  })

  it('should initialize with predefined values', async () => {
    const { result } = renderHook(() => useDatesRange({ predefinedDateFrom: dateFrom, predefinedDateTo: dateTo }))

    expect(result.current.dateFromMinDate).toStrictEqual(dayjs(dateFrom))
    expect(result.current.dateFromMaxDate).toStrictEqual(dayjs(dateTo))
    expect(result.current.dateToMinDate).toStrictEqual(dayjs(dateFrom))
    expect(result.current.dateToMaxDate).toStrictEqual(dayjs(dateTo))
  })
})

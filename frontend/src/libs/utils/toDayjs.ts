import dayjs, { Dayjs } from 'dayjs'

export const toDayjs = (value: unknown): Dayjs | undefined => {
  if (value?.$d instanceof Date) return dayjs(value.$d)
  if (value instanceof Date) return dayjs(value)
  if (typeof value === 'string') return dayjs(value)
  return undefined
}

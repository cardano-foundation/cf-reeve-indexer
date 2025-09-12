import { TableColumnsDef, TableRowModel } from './Table.types'

export const createColumns =
  <T extends TableRowModel = TableRowModel>() =>
  <C extends TableColumnsDef<T>>(columns: C) =>
    columns

export const sortBooleanValues = (current: boolean | undefined | null, next: boolean | undefined | null, order: 'asc' | 'desc') => {
  if (current === next) return 0

  return order === 'desc' ? (current ? -1 : 1) : current ? 1 : -1
}

export const sortNumberValues = (current: number | undefined | null, next: number | undefined | null, order: 'asc' | 'desc') => {
  if (current === next) return 0

  return order === 'desc' ? ((current ?? 0) < (next ?? 0) ? 1 : -1) : (current ?? 0) > (next ?? 0) ? 1 : -1
}

export const sortStringValues = (current: string | undefined | null, next: string | undefined | null, order: 'asc' | 'desc') => {
  if (current === next) return 0

  return order === 'desc' ? (next ?? '').localeCompare(current ?? '') : (current ?? '').localeCompare(next ?? '')
}

export const sortDateValues = (current: Date | undefined | null, next: Date | undefined | null, order: 'asc' | 'desc') => {
  if (current === next) return 0

  return order === 'desc' ? ((current ?? new Date(0)) < (next ?? new Date(0)) ? 1 : -1) : (current ?? new Date(0)) > (next ?? new Date(0)) ? 1 : -1
}

export function sortAllValues<T extends TableRowModel = TableRowModel>(array: T[], columns: TableColumnsDef<T>, orderBy: keyof T, order: 'asc' | 'desc') {
  return array.sort((current, next) => {
    const currentValue = columns.find((column) => column.field === orderBy)?.valueGetter?.(current[orderBy], current) ?? current[orderBy]
    const nextValue = columns.find((column) => column.field === orderBy)?.valueGetter?.(next[orderBy], next) ?? next[orderBy]

    if (typeof currentValue === 'string' && typeof nextValue === 'string') {
      return sortStringValues(currentValue, nextValue, order)
    }

    if ((typeof currentValue === 'string' && new Date(currentValue)) || (typeof nextValue === 'string' && new Date(nextValue))) {
      return sortStringValues(currentValue, nextValue, order)
    }

    if (typeof currentValue === 'number' || parseFloat(currentValue) || typeof nextValue === 'number' || parseFloat(nextValue)) {
      return sortNumberValues(currentValue, nextValue, order)
    }

    return sortBooleanValues(currentValue, nextValue, order)
  })
}

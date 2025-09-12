import { GridColDef } from '@mui/x-data-grid'

export const getTogglableColumns = (columns: GridColDef[]) =>
  columns.reduce<string[]>((acc, column) => {
    if (column.hideable) {
      acc.push(column.field)
    }

    return acc
  }, [])

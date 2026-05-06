import { snakeToNormal } from 'modules/public-reports/utils/format'
import { NestedMap } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export const getLabel = (key: string, t: any) => {
  const translated = t({ id: key })

  if (translated && translated !== key) return translated

  return snakeToNormal(key)
}

export const camelize = (s: string) =>
  s
    .split(/_|(?=[A-Z])/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

export const getTotalLabel = (key: string, label: string, t: any) => {
  const totalKey = `total${camelize(key)}`
  const translated = t({ id: totalKey })

  if (translated && translated !== totalKey) return translated

  return `Total ${label}`
}

export const computeNestedSum = (data: NestedMap): number =>
  Object.entries(data)
    .filter(([key]) => !key.toLowerCase().startsWith('total'))
    .reduce((sum, [, val]) => {
      if (typeof val === 'object' && val !== null) {
        return sum + computeNestedSum(val as NestedMap)
      }

      const n = Number.parseFloat(val as string)
      return sum + (isNaN(n) ? 0 : n)
    }, 0)

export const formatToFloatReadyFormat = (value: string) => (value && !isNaN(parseFloat(value)) ? value : '0').replace(/,/g, '')

export const sumTotals = (values: string[]) => values.reduce((acc, value) => acc + parseFloat(formatToFloatReadyFormat(value)), 0)

export const formatCurrency = (value: string) => {
  const startIndex = value.indexOf(':')

  return value.slice(startIndex + 1, startIndex + 4)
}

export const snakeToNormal = (input: string): string => {
  if (!input) return ''

  return input
    .split('_') // split into words
    .map((word, index) => {
      const lower = word.toLowerCase()
      // Capitalize the first word, keep others lowercase
      return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower
    })
    .join(' ')
}

export const formatToFloatReadyFormat = (value: string) => (value && !isNaN(parseFloat(value)) ? value : '0').replace(/,/g, '')

export const sumTotals = (values: string[]) => values.reduce((acc, value) => acc + parseFloat(formatToFloatReadyFormat(value)), 0)

export const formatCurrency = (value: string) => value.slice(-3)

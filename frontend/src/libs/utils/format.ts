interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: Intl.LocalesArgument
}

export const formatNumber = (value: number, options?: FormatNumberOptions) => {
  const { locale = 'en-US', ...rest } = options ?? {}

  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, ...rest }).format(value)
}

export const formatNumberCurrency = (value: number, options?: Omit<FormatNumberOptions, 'style'>) => {
  const { locale = 'en-US', currency = 'CHF', ...rest } = options ?? {}

  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2, ...rest }).format(value)
}

export const formatNumberPercentage = (value: number, options?: Omit<FormatNumberOptions, 'style'>) => {
  const { locale = 'en-US', ...rest } = options ?? {}

  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2, ...rest }).format(value)
}

export const formatDate = (date: Date, options?: FormatNumberOptions) => {
  const { locale = 'en-US', ...rest } = options ?? {}

  return new Intl.DateTimeFormat(locale, { ...rest }).format(date)
}

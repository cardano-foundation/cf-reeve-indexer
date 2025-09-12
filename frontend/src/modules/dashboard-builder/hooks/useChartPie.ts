interface Data<T = unknown> {
  id: T
  label: string
  value: number
}

export const useChartPie = <T extends string>(data: Data<T>[]) => {
  const total = data.reduce((acc, { value }) => acc + value, 0)

  const transformedData = data.map(({ value, ...rest }) => ({
    ...rest,
    value: Math.round((value / total) * 100 * 100) / 100
  }))

  return transformedData
}

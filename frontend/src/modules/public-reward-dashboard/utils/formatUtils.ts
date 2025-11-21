/**
 * Converts snake_case string to Title Case
 * Example: "total_amount" => "Total Amount"
 */
export const snakeCaseToTitleCase = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Converts Map<string, string> values to numbers
 */
export const mapValuesToNumbers = (data?: Map<string, string>): Record<string, number> => {
  if (!data) return {}

  const result: Record<string, number> = {}

  // Handle both Map and plain object
  if (data instanceof Map) {
    data.forEach((value, key) => {
      result[key] = parseFloat(value) || 0
    })
  } else {
    Object.entries(data).forEach(([key, value]) => {
      result[key] = parseFloat(value as string) || 0
    })
  }

  return result
}

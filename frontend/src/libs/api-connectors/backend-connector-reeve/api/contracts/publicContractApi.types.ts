export type Organisation = {
  id: string
  name: string
  currency_id: string
  country_code: string
  tax_id_number: string
}

export type ContractResponse = {
  timestamp: string
  datum_data?: Map<string, string>
  redeemer_data?: Map<string, string>
}

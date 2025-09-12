export interface ChartOfAccountFormValues {
  customerCode: string
  description: string
  currency: string
  eventRefCode: string
  type: number | string
  subType: number | string
  counterParty: string

  hasParent: boolean
  parentCustomerCode: string

  hasBalance: boolean
  balanceFCY: string
  balanceLCY: string
  originalCurrencyIdFCY: string
  originalCurrencyIdLCY: string
  balanceType: string
  date: string

  active: boolean
}

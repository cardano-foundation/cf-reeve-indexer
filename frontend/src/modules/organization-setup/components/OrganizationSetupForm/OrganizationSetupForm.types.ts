export enum SetupType {
  CHART_OF_ACCOUNTS = 'CHART_OF_ACCOUNTS',
  COST_CENTERS = 'COST_CENTERS',
  VAT_CODES = 'VAT_CODES',
  EVENT_CODES = 'EVENT_CODES',
  REFERENCE_CODES = 'REFERENCE_CODES'
}

export interface OrganizationSetupFormValues {
  setupType: SetupType
  file: File | null
}

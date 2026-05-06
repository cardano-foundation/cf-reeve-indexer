export type LegacyReportConfig = {
  /** Explicit ordering for top-level sections. Sections not listed keep their original position. */
  fieldOrder: string[]
  /**
   * Whether to apply cumulative totals across sections.
   * When true, each section's total includes the sum of all previous sections.
   */
  cumulativeSections?: boolean
  /**
   * The nested section whose displayed total should be overridden with the cumulative grand sum.
   * Only needed when that section is a nested object whose children don't already represent the full total.
   * Omit when the grand total is a plain leaf value already storing the correct pre-computed total.
   */
  grandTotalField?: string
}

/**
 * Legacy report configurations keyed by the report's database ID.
 *
 * To add a new legacy report:
 *  1. Find the report's ID in the database.
 *  2. Add an entry here with the desired fieldOrder and (optionally) grandTotalField.
 */
export const LEGACY_REPORT_CONFIGS: Record<string, LegacyReportConfig> = {
  // INCOME_STATEMENT 2025 FY: operating_results / results_before_taxes / result_for_the_year (nested, cumulative)
  '362c7721d199aa8e2d16495651d6ac40f70bd276d121c2d4eebdc33b5cdcb968': {
    fieldOrder: ['operating_results', 'results_before_taxes', 'result_for_the_year'],
    grandTotalField: 'result_for_the_year'
  },
  // INCOME_STATEMENT 2024 Dec: revenues / ... / profit_for_the_year (leaf)
  'd2cca6a334963e0adfa576187b2b337dc499352335c03fdf23a6d87beec35769': {
    fieldOrder: ['revenues', 'cost_of_goods_and_services', 'operating_expenses', 'financial_income', 'extraordinary_income', 'tax_expenses', 'profit_for_the_year']
  },
  // BALANCE_SHEET: assets / liabilities / capital (add txHash when known)
  '4b4059590633a4132779cfa05e20fc5211ccc6aee55f8a18574ab73839023417': {
  fieldOrder: ['assets', 'liabilities', 'capital']
  }
}

/** Returns the legacy config for the given report txHash, or undefined if not a known legacy report. */
export const getLegacyReportConfig = (txHash: string): LegacyReportConfig | undefined =>
  LEGACY_REPORT_CONFIGS[txHash]

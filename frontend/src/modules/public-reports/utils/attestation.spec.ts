import { describe, expect, it } from 'vitest'

import { isSameOrganisationName } from './attestation'

describe('isSameOrganisationName', () => {
  it('matches identical names regardless of case', () => {
    expect(isSameOrganisationName('Cardano Foundation', 'CARDANO FOUNDATION')).toBe(true)
  })

  it('ignores legal forms and punctuation', () => {
    expect(isSameOrganisationName('Example Audit', 'Example Audit AG')).toBe(true)
    expect(isSameOrganisationName('Example Audit GmbH', 'Example Audit, Ltd.')).toBe(true)
  })

  it('ignores accents', () => {
    expect(isSameOrganisationName('Societe Generale', 'Société Générale SA')).toBe(true)
  })

  it('does not match when one name only contains the other', () => {
    expect(isSameOrganisationName('Cardano Foundation', 'Cardano Foundation Zug')).toBe(false)
    expect(isSameOrganisationName('Cardano Foundation', 'Cardano Foundation Audit Services')).toBe(false)
  })

  it('does not match similar but different names', () => {
    expect(isSameOrganisationName('Alpine Energy', 'Alpina Energy')).toBe(false)
    expect(isSameOrganisationName('Cardano Foundation', 'Example Audit AG')).toBe(false)
  })

  it('does not match empty or missing names', () => {
    expect(isSameOrganisationName('Cardano Foundation', null)).toBe(false)
    expect(isSameOrganisationName(undefined, 'Cardano Foundation')).toBe(false)
    expect(isSameOrganisationName('AG', 'GmbH')).toBe(false)
  })
})

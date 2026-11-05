import { describe, expect, it } from 'vitest'

import { describeClaims } from './credentialClaims'

/**
 * The rules that make a credential readable without teaching this file about every schema. The badge
 * specs cover the rendering; this covers the decisions.
 */
describe('describeClaims', () => {
  it('gives known claims a proper label instead of the issuer’s field name', () => {
    const rows = describeClaims({ engagementContextRole: 'Engineer', personLegalName: 'Ada Lovelace' })

    expect(rows.map((row) => row.label)).toEqual(['Name', 'Role'])
    expect(rows.map((row) => row.value)).toEqual(['Ada Lovelace', 'Engineer'])
  })

  it('orders identity before role before everything else, whatever order the issuer used', () => {
    const rows = describeClaims({ department: 'R&D', engagementContextRole: 'Engineer', firstName: 'Ada' })

    expect(rows.map((row) => row.label)).toEqual(['First name', 'Role', 'Department'])
  })

  /** The point of the fallback: an unrecognised schema still shows everything it carries. */
  it('humanises an unknown key rather than dropping the claim', () => {
    const rows = describeClaims({ some_custom_field: 'value', anotherOddOne: 'x' })

    expect(rows.map((row) => row.label)).toEqual(['Some custom field', 'Another odd one'])
  })

  it('keeps unknown claims in the order the credential listed them', () => {
    const rows = describeClaims({ zebra: '1', apple: '2' })

    expect(rows.map((row) => row.key)).toEqual(['zebra', 'apple'])
  })

  it('marks identifiers monospace so they are not misread', () => {
    const rows = describeClaims({ LEI: '5493001KJTIIGC8Y1R12', role: 'Engineer' })

    expect(rows.find((row) => row.key === 'LEI')?.mono).toBe(true)
    expect(rows.find((row) => row.key === 'role')?.mono).toBe(false)
  })

  it('detects an identifier-shaped value even under an unknown key', () => {
    const rows = describeClaims({ somethingUnknown: 'EJ7F9XqvE0e1Sv8kX2nQ4bT6yZ3wR5uL8mN0pC1dG2hI' })

    expect(rows[0].mono).toBe(true)
  })

  /** A blank row would read as "the credential says nothing about that" — a different statement. */
  it('stringifies a nested claim rather than skipping it', () => {
    const rows = describeClaims({ address: { city: 'Zug' } })

    expect(rows[0].value).toBe('{"city":"Zug"}')
  })

  it('renders a null claim as an explicit dash', () => {
    const rows = describeClaims({ role: null })

    expect(rows[0].value).toBe('—')
  })

  it('returns nothing for absent, null or empty claims', () => {
    expect(describeClaims(undefined)).toEqual([])
    expect(describeClaims(null)).toEqual([])
    expect(describeClaims({})).toEqual([])
  })
})

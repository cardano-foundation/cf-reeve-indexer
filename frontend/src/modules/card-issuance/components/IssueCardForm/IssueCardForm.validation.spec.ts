import { describe, expect, it } from 'vitest'

import { isValidEmail, validateFields } from './IssueCardForm.validation'
import type { IssueCardFields } from './IssueCardForm.validation'

const base: IssueCardFields = {
  displayName: '',
  email: '',
  organisationId: '',
  label: ''
}

describe('isValidEmail (mirrors the backend shape check)', () => {
  it('accepts exactly one @ that is neither first nor last char', () => {
    expect(isValidEmail('a@b')).toBe(true)
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('rejects a missing @, or an @ at the first or last position', () => {
    expect(isValidEmail('ab')).toBe(false)
    expect(isValidEmail('a@')).toBe(false)
    expect(isValidEmail('@b')).toBe(false)
  })

  it('rejects more than one @', () => {
    expect(isValidEmail('a@b@c')).toBe(false)
  })

  it('rejects addresses longer than 320 chars', () => {
    expect(isValidEmail('a'.repeat(318) + '@b')).toBe(true) // 320 chars
    expect(isValidEmail('a'.repeat(319) + '@b')).toBe(false) // 321 chars
  })
})

describe('validateFields', () => {
  it('accepts an entirely empty form — every field is optional for an external holder', () => {
    expect(validateFields(base)).toEqual({})
  })

  it('treats an empty email as valid (optional) but flags a malformed one', () => {
    expect(validateFields({ ...base, email: '' }).email).toBeUndefined()
    expect(validateFields({ ...base, email: 'a@b.c' }).email).toBeUndefined()
    expect(validateFields({ ...base, email: 'nope' }).email).toBeDefined()
  })

  it('rejects an organisationId longer than 64 chars', () => {
    expect(validateFields({ ...base, organisationId: 'o'.repeat(64) }).organisationId).toBeUndefined()
    expect(validateFields({ ...base, organisationId: 'o'.repeat(65) }).organisationId).toBeDefined()
  })

  it('rejects a displayName or label longer than 255 chars', () => {
    expect(validateFields({ ...base, displayName: 'd'.repeat(255) }).displayName).toBeUndefined()
    expect(validateFields({ ...base, displayName: 'd'.repeat(256) }).displayName).toBeDefined()
    expect(validateFields({ ...base, label: 'l'.repeat(256) }).label).toBeDefined()
  })

  it('treats an all-whitespace optional value as blank rather than too long, as the backend does', () => {
    // The backend blank-checks first and only length-checks a non-blank value, so an over-long
    // whitespace-only field is simply omitted from the card — never a validation error.
    expect(validateFields({ ...base, displayName: ' '.repeat(300) }).displayName).toBeUndefined()
    expect(validateFields({ ...base, label: ' '.repeat(300) }).label).toBeUndefined()
    expect(validateFields({ ...base, organisationId: ' '.repeat(100) }).organisationId).toBeUndefined()
  })
})

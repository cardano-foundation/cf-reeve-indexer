import { describe, expect, it } from 'vitest'

import { buildCard, formatInstantSeconds, parseCard } from './cards'
import type { KeyCard } from './cards'

const baseCard: KeyCard = {
  v: 1,
  type: 'REEVE_KEY_CARD',
  subject: { subjectType: 'EXTERNAL', subjectId: 'uuid-1', organisationId: 'org-1' },
  key: { publicKey: 'ab'.repeat(32), label: 'Test key', assurance: 'PASSKEY', createdAt: '2026-07-14T10:15:30Z' }
}

describe('key cards', () => {
  it('parses a valid unsigned card', () => {
    const card = parseCard(JSON.stringify(baseCard))
    expect(card.key.publicKey).toBe('ab'.repeat(32))
    // An unsigned card carries no issuer object and no signature.
    expect('issuer' in card).toBe(false)
    expect('signature' in card).toBe(false)
  })

  it('rejects unknown versions and wrong types instead of guessing (I7)', () => {
    expect(() => parseCard(JSON.stringify({ ...baseCard, v: 2 }))).toThrow()
    expect(() => parseCard(JSON.stringify({ ...baseCard, type: 'SOMETHING' }))).toThrow()
    expect(() => parseCard('not json')).toThrow()
  })

  it('rejects a card missing the subject or key section', () => {
    expect(() => parseCard(JSON.stringify({ v: 1, type: 'REEVE_KEY_CARD', key: baseCard.key }))).toThrow('Malformed card')
    expect(() => parseCard(JSON.stringify({ v: 1, type: 'REEVE_KEY_CARD', subject: baseCard.subject }))).toThrow('Malformed card')
  })
})

describe('buildCard (client-side assembly)', () => {
  const createdAt = '2026-07-16T10:15:30Z'
  const pk = 'ab'.repeat(32)

  it('assembles a v1 unsigned REEVE_KEY_CARD that round-trips through parseCard', () => {
    const card = buildCard({
      subject: { subjectType: 'EXTERNAL', subjectId: 'uuid-1', organisationId: 'org-1' },
      publicKeyHex: pk,
      label: 'Laptop',
      createdAt
    })

    expect(card.v).toBe(1)
    expect(card.type).toBe('REEVE_KEY_CARD')
    expect(card.key.publicKey).toBe(pk)
    expect(card.key.assurance).toBe('PASSKEY')
    expect(card.key.createdAt).toBe(createdAt)
    expect(card.key.label).toBe('Laptop')
    // The assembled card must be readable by the parser it is meant for.
    expect(parseCard(JSON.stringify(card))).toEqual(card)
  })

  it('omits blank optional fields and defaults organisationId to an empty string', () => {
    const card = buildCard({
      subject: { subjectType: 'EXTERNAL', subjectId: 'uuid-2', displayName: '  ', email: '' },
      publicKeyHex: pk,
      label: '   ',
      createdAt
    })

    expect('displayName' in card.subject).toBe(false)
    expect('email' in card.subject).toBe(false)
    expect('label' in card.key).toBe(false)
    expect(card.subject.organisationId).toBe('')
  })

  it('keeps provided optional fields and an explicit assurance', () => {
    const card = buildCard({
      subject: { subjectType: 'REEVE_ACCOUNT', subjectId: 'sub-1', displayName: 'Aud Itor', email: 'a@b.c', organisationId: 'org-9' },
      publicKeyHex: pk,
      label: 'Key',
      assurance: 'PORTABLE',
      createdAt
    })

    expect(card.subject.displayName).toBe('Aud Itor')
    expect(card.subject.email).toBe('a@b.c')
    expect(card.subject.organisationId).toBe('org-9')
    expect(card.key.assurance).toBe('PORTABLE')
  })

  it('carries no issuer, signature, or private-key material (public-only)', () => {
    const card = buildCard({ subject: { subjectType: 'EXTERNAL', subjectId: 'u' }, publicKeyHex: pk, createdAt })
    const json = JSON.stringify(card)

    expect(json).not.toContain('issuer')
    expect(json).not.toContain('signature')
    expect(json).not.toContain('privateKey')
    expect(json).toContain(pk)
  })
})

describe('formatInstantSeconds', () => {
  it('strips milliseconds to second precision, keeping the Z suffix', () => {
    expect(formatInstantSeconds(new Date('2026-07-16T10:15:30.123Z'))).toBe('2026-07-16T10:15:30Z')
  })

  it('leaves an already second-precise instant unchanged', () => {
    expect(formatInstantSeconds(new Date('2026-07-16T10:15:30Z'))).toBe('2026-07-16T10:15:30Z')
  })
})

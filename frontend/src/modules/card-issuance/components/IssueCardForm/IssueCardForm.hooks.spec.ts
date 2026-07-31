import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { KeyCard } from 'libs/document-vault-crypto/cards'
import type { IssueSubject } from 'libs/document-vault-crypto/issue'

import type { PasskeyMode } from './IssueCardForm.hooks'
import { useIssueCardForm } from './IssueCardForm.hooks'

const PUBLIC_KEY_HEX = 'ab'.repeat(32)
const CREDENTIAL_ID = 'cred-abc'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_SECONDS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/

const subject: IssueSubject = {
  displayName: 'Ada Lovelace',
  email: 'ada@example.com',
  organisationId: 'org-1'
}

const makeDeriveKeypair = () =>
  vi.fn(async (_args: { mode: PasskeyMode; user: { name: string; displayName: string } }) => ({
    publicKeyHex: PUBLIC_KEY_HEX,
    credentialId: CREDENTIAL_ID
  }))

describe('useIssueCardForm (client-side, permissionless, external-only)', () => {
  it('builds a public-only card in the browser from the passkey-derived key — no network call', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    let returned: KeyCard | null = null
    await act(async () => {
      returned = await result.current.issue(subject, 'Primary key')
    })

    expect(deriveKeypair).toHaveBeenCalledTimes(1)
    expect(returned).not.toBeNull()
    expect(returned!.v).toBe(1)
    expect(returned!.type).toBe('REEVE_KEY_CARD')
    expect(returned!.key.publicKey).toBe(PUBLIC_KEY_HEX)
    expect(returned!.key.assurance).toBe('PASSKEY')
    expect(returned!.subject.displayName).toBe('Ada Lovelace')
    expect(returned!.subject.email).toBe('ada@example.com')

    const payload = JSON.stringify(returned)
    expect(payload).not.toContain('privateKey')
    expect(payload).not.toContain('wrapped')

    expect(result.current.status).toBe('issued')
    expect(result.current.issuedCard).toEqual(returned)
    // The hook holds no private key material at all (I1/I5): nothing on its surface exposes one.
    expect(result.current).not.toHaveProperty('privateKeyHex')
  })

  it('always marks the subject EXTERNAL and mints its subjectId — the holder never supplies one', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    let first: KeyCard | null = null
    await act(async () => {
      first = await result.current.issue(subject, 'Primary key')
    })
    expect(first!.subject.subjectType).toBe('EXTERNAL')
    expect(first!.subject.subjectId).toMatch(UUID_RE)

    act(() => result.current.reset())

    let second: KeyCard | null = null
    await act(async () => {
      second = await result.current.issue(subject, 'Primary key')
    })
    // A minted id is per-card: two cards are two distinct holders, never the same identity.
    expect(second!.subject.subjectId).toMatch(UUID_RE)
    expect(second!.subject.subjectId).not.toBe(first!.subject.subjectId)
  })

  it('threads the passkey mode: create by default, existing when requested', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    await act(async () => {
      await result.current.issue(subject, 'Primary key')
    })
    expect(deriveKeypair.mock.calls[0][0].mode).toBe('create')

    act(() => result.current.reset())

    await act(async () => {
      await result.current.issue(subject, 'Primary key', 'existing')
    })
    expect(deriveKeypair.mock.calls[1][0].mode).toBe('existing')
  })

  it('builds a card from an entirely empty subject — every field is optional', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    let card: KeyCard | null = null
    await act(async () => {
      card = await result.current.issue({}, '')
    })

    expect(card!.subject.subjectType).toBe('EXTERNAL')
    expect(card!.subject.subjectId).toMatch(UUID_RE)
    expect(card!.subject.organisationId).toBe('')
    expect('displayName' in card!.subject).toBe(false)
    expect('email' in card!.subject).toBe(false)
    expect('label' in card!.key).toBe(false)
    expect(card!.key.publicKey).toBe(PUBLIC_KEY_HEX)
  })

  it('stamps createdAt at second precision (no milliseconds)', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    let card: KeyCard | null = null
    await act(async () => {
      card = await result.current.issue(subject, 'Primary key')
    })
    expect(card!.key.createdAt).toMatch(ISO_SECONDS_RE)
  })

  it('moves to error status when passkey derivation is cancelled (no card built)', async () => {
    const deriveKeypair = vi.fn().mockRejectedValue(new Error('Passkey creation was cancelled.'))
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    let returned: KeyCard | null = null
    await act(async () => {
      returned = await result.current.issue(subject, 'Primary key')
    })

    expect(returned).toBeNull()
    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Passkey creation was cancelled.')
    expect(result.current.issuedCard).toBeNull()
  })

  it('reset() clears the retained key so the next issue derives a fresh passkey', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    await act(async () => {
      await result.current.issue(subject, 'Primary key')
    })
    act(() => result.current.reset())
    await act(async () => {
      await result.current.issue(subject, 'Primary key')
    })

    expect(deriveKeypair).toHaveBeenCalledTimes(2)
  })

  it('reset() returns to idle with no issued card', async () => {
    const deriveKeypair = makeDeriveKeypair()
    const { result } = renderHook(() => useIssueCardForm({ deps: { deriveKeypair } }))

    await act(async () => {
      await result.current.issue(subject, 'Primary key')
    })
    act(() => result.current.reset())

    expect(result.current.status).toBe('idle')
    expect(result.current.issuedCard).toBeNull()
  })

  it('starts idle exposing no private key material', () => {
    const { result } = renderHook(() => useIssueCardForm())

    expect(result.current.status).toBe('idle')
    expect(result.current.issuedCard).toBeNull()
    expect(result.current).not.toHaveProperty('privateKeyHex')
  })
})

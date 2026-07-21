import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import type { DecryptOutcome, Envelope } from 'libs/document-vault-crypto/decrypt'

import { useDecryptPanel } from './DecryptPanel.hooks'

const anchor: DocumentView = {
  tx_hash: 'tx-1',
  document_id: 'doc-1',
  organisation_id: 'org-1',
  ipfs_cid: 'bafy-1',
  content_hash: 'a'.repeat(64),
  plaintext_hash: 'b'.repeat(64),
  envelope_version: 1,
  slot_count: 2,
  slot: 12345,
  block_time: 1_700_000_000,
  checks: { manifest: 'PASS', ipfs: 'PASS', content_hash: 'PASS', envelope: 'PASS' },
  verdict: 'VERIFIED',
  created_at: '2026-07-14T00:00:00Z'
}

const fakeEnvelope: Envelope = {
  version: 1,
  type: 'REEVE_ENCRYPTED_DOCUMENT',
  content_hash: 'a'.repeat(64),
  plaintext_hash: 'b'.repeat(64),
  payload: { ciphertext: 'AA==', nonce: '00'.repeat(12) },
  slots: []
}

describe('useDecryptPanel', () => {
  it('sets keyReady when given a valid 64-hex raw private key', () => {
    const { result } = renderHook(() => useDecryptPanel({ anchor }))

    act(() => result.current.setRawKey('11'.repeat(32)))

    expect(result.current.status).toBe('keyReady')
    expect(result.current.errorMessage).toBeNull()
  })

  it('rejects a raw key that is not 64 hex characters, staying idle with an error', () => {
    const { result } = renderHook(() => useDecryptPanel({ anchor }))

    act(() => result.current.setRawKey('not-hex'))

    expect(result.current.status).toBe('idle')
    expect(result.current.errorMessage).not.toBeNull()
  })

  it('unlockWithPasskey derives a key from the passkey and moves to keyReady', async () => {
    const deriveKeypair = vi.fn().mockResolvedValue('11'.repeat(32))
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { deriveKeypair } }))

    await act(async () => {
      await result.current.unlockWithPasskey()
    })

    expect(deriveKeypair).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('keyReady')
    expect(result.current.errorMessage).toBeNull()
  })

  it('surfaces a passkey derivation failure without moving to keyReady', async () => {
    const deriveKeypair = vi.fn().mockRejectedValue(new Error('Passkey assertion was cancelled.'))
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { deriveKeypair } }))

    await act(async () => {
      await result.current.unlockWithPasskey()
    })

    expect(result.current.status).not.toBe('keyReady')
    expect(result.current.errorMessage).toBe('Passkey assertion was cancelled.')
  })

  it('decrypts with the passkey-derived key against the fetched envelope', async () => {
    const outcome: DecryptOutcome = {
      plaintext: new Uint8Array([9]),
      slotIndex: 0,
      plaintextHashHex: 'b'.repeat(64),
      plaintextHashMatches: true
    }
    const deriveKeypair = vi.fn().mockResolvedValue('11'.repeat(32))
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(outcome)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { deriveKeypair, fetchEnvelope, decrypt } }))

    await act(async () => {
      await result.current.unlockWithPasskey()
    })
    await act(async () => {
      await result.current.decrypt()
    })

    expect(fetchEnvelope).toHaveBeenCalledTimes(1)
    expect(decrypt).toHaveBeenCalledWith('11'.repeat(32), fakeEnvelope, 'b'.repeat(64))
    expect(result.current.status).toBe('success')
  })

  it('reset() clears the key material so a subsequent decrypt() is a no-op', async () => {
    const fetchEnvelope = vi.fn()
    const decrypt = vi.fn()
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))
    expect(result.current.status).toBe('keyReady')

    act(() => result.current.reset())
    expect(result.current.status).toBe('idle')

    await act(async () => {
      await result.current.decrypt()
    })

    expect(fetchEnvelope).not.toHaveBeenCalled()
    expect(decrypt).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
  })

  it('moves to failure with the verbatim "no key opens" message when no slot opens', async () => {
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(null)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))

    await act(async () => {
      await result.current.decrypt()
    })

    expect(result.current.status).toBe('failure')
    expect(result.current.errorMessage).toBe('None of your keys can open this document.')
    expect(fetchEnvelope).toHaveBeenCalledWith({ documentId: 'doc-1', txHash: 'tx-1' })
  })

  it('surfaces the thrown error message verbatim on decrypt failure (I7) instead of a generic message', async () => {
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockRejectedValue(new Error('Unsupported envelope version: 2'))
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))

    await act(async () => {
      await result.current.decrypt()
    })

    expect(result.current.status).toBe('failure')
    expect(result.current.errorMessage).toBe('Unsupported envelope version: 2')
  })

  it('moves to success carrying the decrypt outcome, including plaintextHashMatches', async () => {
    const outcome: DecryptOutcome = {
      plaintext: new Uint8Array([1, 2, 3]),
      slotIndex: 0,
      plaintextHashHex: 'b'.repeat(64),
      plaintextHashMatches: true
    }
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(outcome)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))

    await act(async () => {
      await result.current.decrypt()
    })

    expect(result.current.status).toBe('success')
    expect(result.current.outcome?.plaintextHashMatches).toBe(true)
    expect(decrypt).toHaveBeenCalledWith('11'.repeat(32), fakeEnvelope, 'b'.repeat(64))
  })

  it('clears the private key material after a decrypt attempt so a second click is a no-op', async () => {
    const outcome: DecryptOutcome = {
      plaintext: new Uint8Array([1]),
      slotIndex: 0,
      plaintextHashHex: 'b'.repeat(64),
      plaintextHashMatches: true
    }
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(outcome)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))
    await act(async () => {
      await result.current.decrypt()
    })
    expect(decrypt).toHaveBeenCalledTimes(1)

    // status is now 'success', not 'keyReady' - a second decrypt() call must be a no-op.
    await act(async () => {
      await result.current.decrypt()
    })
    expect(decrypt).toHaveBeenCalledTimes(1)
  })

  it('discards a previously-set raw key when re-deriving from a passkey (I1 hygiene)', async () => {
    // unlockWithPasskey clears the staged raw key before deriving; if the passkey derive then fails,
    // no stale key remains for a decrypt() to use.
    const deriveKeypair = vi.fn().mockRejectedValue(new Error('Passkey assertion was cancelled.'))
    const fetchEnvelope = vi.fn()
    const decrypt = vi.fn()
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { deriveKeypair, fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))
    expect(result.current.status).toBe('keyReady')

    await act(async () => {
      await result.current.unlockWithPasskey()
    })
    expect(result.current.status).not.toBe('keyReady')

    await act(async () => {
      await result.current.decrypt()
    })
    expect(fetchEnvelope).not.toHaveBeenCalled()
    expect(decrypt).not.toHaveBeenCalled()
  })
})

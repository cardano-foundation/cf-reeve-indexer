import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DocumentVerdict, DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
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
  recipient_count: 2,
  recipient_key_hashes: [],
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
      recipientIndex: 0,
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

  it('surfaces the thrown error message verbatim on decrypt failure instead of a generic message', async () => {
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
      recipientIndex: 0,
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
      recipientIndex: 0,
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

  it('discards a previously-set raw key when re-deriving from a passkey', async () => {
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

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const withVerdict = (verdict: DocumentVerdict, overrides: Partial<DocumentView> = {}): DocumentView => ({ ...anchor, verdict, ...overrides })

const verifiedOutcome: DecryptOutcome = {
  plaintext: new Uint8Array([1, 2, 3]),
  recipientIndex: 0,
  plaintextHashHex: 'b'.repeat(64),
  plaintextHashMatches: true
}

// Another VERIFIED anchor of the same document (duplicate anchors). The panel is not remounted when
// the user switches to it, so the hook itself must carry nothing over.
const otherAnchor = withVerdict('VERIFIED', { tx_hash: 'tx-2' })

describe('useDecryptPanel — only decrypts VERIFIED anchors', () => {
  it.each([
    ['VERIFIED', 'available'],
    ['PENDING', 'pending'],
    // The indexer keeps retrying IPFS after this verdict, and the anchor can still reach VERIFIED.
    ['IPFS_UNAVAILABLE', 'pending'],
    ['MALFORMED_MANIFEST', 'unavailable'],
    ['CONTENT_HASH_MISMATCH', 'unavailable'],
    ['MALFORMED_ENVELOPE', 'unavailable']
  ] as const)('reports a %s anchor as %s', (verdict, availability) => {
    const { result } = renderHook(() => useDecryptPanel({ anchor: withVerdict(verdict) }))

    expect(result.current.availability).toBe(availability)
  })

  it('treats a verdict it does not know as unavailable', () => {
    // A verdict added to the backend before this client learns it: fail closed, and not as "pending".
    const { result } = renderHook(() => useDecryptPanel({ anchor: withVerdict('REVOKED' as DocumentVerdict) }))

    expect(result.current.availability).toBe('unavailable')
  })

  it.each(['PENDING', 'CONTENT_HASH_MISMATCH'] as const)(
    'never prompts for a passkey, stages a key or fetches the envelope for a %s anchor',
    async (verdict) => {
      const deriveKeypair = vi.fn().mockResolvedValue('11'.repeat(32))
      const fetchEnvelope = vi.fn()
      const decrypt = vi.fn()
      const { result } = renderHook(() => useDecryptPanel({ anchor: withVerdict(verdict), deps: { deriveKeypair, fetchEnvelope, decrypt } }))

      await act(async () => {
        await result.current.unlockWithPasskey()
      })
      expect(deriveKeypair).not.toHaveBeenCalled()
      expect(result.current.status).toBe('idle')

      act(() => result.current.setRawKey('11'.repeat(32)))
      expect(result.current.status).toBe('idle')

      await act(async () => {
        await result.current.decrypt()
      })
      expect(fetchEnvelope).not.toHaveBeenCalled()
      expect(decrypt).not.toHaveBeenCalled()
    }
  )

  it('drops a staged key when the same anchor stops being decryptable', async () => {
    const fetchEnvelope = vi.fn()
    const decrypt = vi.fn()
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { fetchEnvelope, decrypt } }), {
      initialProps: { current: anchor }
    })

    act(() => result.current.setRawKey('11'.repeat(32)))
    expect(result.current.status).toBe('keyReady')

    rerender({ current: withVerdict('PENDING') })
    expect(result.current.status).toBe('idle')

    await act(async () => {
      await result.current.decrypt()
    })
    expect(fetchEnvelope).not.toHaveBeenCalled()
    expect(decrypt).not.toHaveBeenCalled()
  })

  it('clears a decrypted document when another anchor is selected', async () => {
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { fetchEnvelope, decrypt } }), {
      initialProps: { current: anchor }
    })

    act(() => result.current.setRawKey('11'.repeat(32)))
    await act(async () => {
      await result.current.decrypt()
    })
    expect(result.current.status).toBe('success')

    rerender({ current: otherAnchor })

    expect(result.current.status).toBe('idle')
    expect(result.current.outcome).toBeNull()
  })

  it('discards a decrypt that finishes after another anchor was selected', async () => {
    const envelope = deferred<Envelope>()
    const fetchEnvelope = vi.fn().mockReturnValue(envelope.promise)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { fetchEnvelope, decrypt } }), {
      initialProps: { current: anchor }
    })

    act(() => result.current.setRawKey('11'.repeat(32)))
    let running!: Promise<void>
    act(() => {
      running = result.current.decrypt()
    })
    expect(result.current.status).toBe('decrypting')

    rerender({ current: otherAnchor })
    await act(async () => {
      envelope.resolve(fakeEnvelope)
      await running
    })

    // Anchor A's plaintext and its "matches" verdict must never appear under anchor B.
    expect(result.current.status).toBe('idle')
    expect(result.current.outcome).toBeNull()
    expect(result.current.errorMessage).toBeNull()
  })

  it('keeps a key staged on the new anchor when a stale decrypt finishes', async () => {
    const firstEnvelope = deferred<Envelope>()
    const fetchEnvelope = vi.fn().mockReturnValueOnce(firstEnvelope.promise).mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { fetchEnvelope, decrypt } }), {
      initialProps: { current: anchor }
    })

    act(() => result.current.setRawKey('11'.repeat(32)))
    let running!: Promise<void>
    act(() => {
      running = result.current.decrypt()
    })

    rerender({ current: otherAnchor })
    act(() => result.current.setRawKey('22'.repeat(32)))
    await act(async () => {
      firstEnvelope.resolve(fakeEnvelope)
      await running
    })
    expect(result.current.status).toBe('keyReady')

    await act(async () => {
      await result.current.decrypt()
    })
    expect(fetchEnvelope).toHaveBeenLastCalledWith({ documentId: 'doc-1', txHash: 'tx-2' })
    expect(decrypt).toHaveBeenLastCalledWith('22'.repeat(32), fakeEnvelope, 'b'.repeat(64))
    expect(result.current.status).toBe('success')
  })

  it('discards a decrypt error that arrives after another anchor was selected', async () => {
    const envelope = deferred<Envelope>()
    const fetchEnvelope = vi.fn().mockReturnValue(envelope.promise)
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { fetchEnvelope, decrypt: vi.fn() } }), {
      initialProps: { current: anchor }
    })

    act(() => result.current.setRawKey('11'.repeat(32)))
    let running!: Promise<void>
    act(() => {
      running = result.current.decrypt()
    })

    rerender({ current: otherAnchor })
    await act(async () => {
      envelope.reject(new Error('The IPFS gateway did not deliver the envelope'))
      await running
    })

    // Anchor A's failure must not be reported against anchor B.
    expect(result.current.status).toBe('idle')
    expect(result.current.errorMessage).toBeNull()
  })

  it('discards a passkey error that arrives after the anchor stopped being decryptable', async () => {
    const derived = deferred<string>()
    const deriveKeypair = vi.fn().mockReturnValue(derived.promise)
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { deriveKeypair } }), {
      initialProps: { current: anchor }
    })

    let running!: Promise<void>
    act(() => {
      running = result.current.unlockWithPasskey()
    })

    rerender({ current: withVerdict('PENDING') })
    await act(async () => {
      derived.reject(new Error('Passkey assertion was cancelled.'))
      await running
    })

    expect(result.current.errorMessage).toBeNull()
  })

  it('discards a passkey key that arrives after the anchor stopped being decryptable', async () => {
    const derived = deferred<string>()
    const deriveKeypair = vi.fn().mockReturnValue(derived.promise)
    const fetchEnvelope = vi.fn()
    const { result, rerender } = renderHook(({ current }) => useDecryptPanel({ anchor: current, deps: { deriveKeypair, fetchEnvelope } }), {
      initialProps: { current: anchor }
    })

    let running!: Promise<void>
    act(() => {
      running = result.current.unlockWithPasskey()
    })

    rerender({ current: withVerdict('PENDING') })
    await act(async () => {
      derived.resolve('11'.repeat(32))
      await running
    })
    expect(result.current.status).not.toBe('keyReady')

    await act(async () => {
      await result.current.decrypt()
    })
    expect(fetchEnvelope).not.toHaveBeenCalled()
  })
})

// The panel decrypts in the same click that hands over a key. A click handler holds the functions of
// the render it was created in, so these tests capture them the same way and call them in sequence.
describe('useDecryptPanel — decrypts straight after a key is presented', () => {
  it('decrypts with a raw key staged earlier in the same handler', async () => {
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))
    const handler = result.current

    await act(async () => {
      handler.setRawKey('11'.repeat(32))
      await handler.decrypt()
    })

    expect(fetchEnvelope).toHaveBeenCalledTimes(1)
    expect(decrypt).toHaveBeenCalledWith('11'.repeat(32), fakeEnvelope, 'b'.repeat(64))
    expect(result.current.status).toBe('success')
  })

  it('decrypts with a passkey-derived key in the same handler that unlocked it', async () => {
    const deriveKeypair = vi.fn().mockResolvedValue('33'.repeat(32))
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { deriveKeypair, fetchEnvelope, decrypt } }))
    const handler = result.current

    await act(async () => {
      await handler.unlockWithPasskey()
      await handler.decrypt()
    })

    expect(fetchEnvelope).toHaveBeenCalledTimes(1)
    expect(decrypt).toHaveBeenCalledWith('33'.repeat(32), fakeEnvelope, 'b'.repeat(64))
    expect(result.current.status).toBe('success')
  })

  it('starts only one decrypt when called again while the first is still running', async () => {
    const envelope = deferred<Envelope>()
    const fetchEnvelope = vi.fn().mockReturnValue(envelope.promise)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))

    act(() => result.current.setRawKey('11'.repeat(32)))
    // Captured while the key is ready: both calls below come from a render that allows a decrypt.
    const handler = result.current
    let first!: Promise<void>
    let second!: Promise<void>
    act(() => {
      first = handler.decrypt()
      second = handler.decrypt()
    })
    await act(async () => {
      envelope.resolve(fakeEnvelope)
      await Promise.all([first, second])
    })

    expect(fetchEnvelope).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('success')
  })

  it('fetches nothing when the key handed over in the same handler was malformed', async () => {
    const fetchEnvelope = vi.fn()
    const decrypt = vi.fn()
    const { result } = renderHook(() => useDecryptPanel({ anchor, deps: { fetchEnvelope, decrypt } }))
    const handler = result.current

    await act(async () => {
      handler.setRawKey('not-hex')
      await handler.decrypt()
    })

    expect(fetchEnvelope).not.toHaveBeenCalled()
    expect(decrypt).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
  })

  it('fetches nothing when the passkey resolves after another anchor was selected', async () => {
    const derived = deferred<string>()
    const deriveKeypair = vi.fn().mockReturnValue(derived.promise)
    const fetchEnvelope = vi.fn()
    const decrypt = vi.fn()
    const { result, rerender } = renderHook(
      ({ current }) => useDecryptPanel({ anchor: current, deps: { deriveKeypair, fetchEnvelope, decrypt } }),
      { initialProps: { current: anchor } }
    )
    // The click handler still holds anchor A's functions when the passkey finally answers.
    const handler = result.current

    let running!: Promise<void>
    act(() => {
      running = (async () => {
        await handler.unlockWithPasskey()
        await handler.decrypt()
      })()
    })

    rerender({ current: otherAnchor })
    await act(async () => {
      derived.resolve('11'.repeat(32))
      await running
    })

    expect(fetchEnvelope).not.toHaveBeenCalled()
    expect(decrypt).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
  })

  it('never decrypts one anchor with a key handed over for another', async () => {
    const fetchEnvelope = vi.fn().mockResolvedValue(fakeEnvelope)
    const decrypt = vi.fn().mockResolvedValue(verifiedOutcome)
    const { result, rerender } = renderHook(
      ({ current }) => useDecryptPanel({ anchor: current, deps: { fetchEnvelope, decrypt } }),
      { initialProps: { current: anchor } }
    )
    // Held by something created while anchor A was on screen.
    const handlerForA = result.current

    rerender({ current: otherAnchor })
    act(() => result.current.setRawKey('22'.repeat(32)))
    await act(async () => {
      await handlerForA.decrypt()
    })

    expect(fetchEnvelope).not.toHaveBeenCalled()
    expect(decrypt).not.toHaveBeenCalled()
    // Anchor B's key is still there for B.
    expect(result.current.status).toBe('keyReady')
  })
})

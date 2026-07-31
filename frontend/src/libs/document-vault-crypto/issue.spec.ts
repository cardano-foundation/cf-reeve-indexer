import { afterEach, describe, expect, it, vi } from 'vitest'

import type { KeyCard } from './cards'
import { downloadCardFile } from './issue'

const card: KeyCard = {
  v: 1,
  type: 'REEVE_KEY_CARD',
  subject: { subjectType: 'EXTERNAL', subjectId: 'uuid-1', organisationId: '' },
  key: { publicKey: 'ab'.repeat(32), assurance: 'PASSKEY', createdAt: '2026-07-16T10:15:30Z' }
}

describe('downloadCardFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serialises the card to a JSON blob and triggers a named client-side download', () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock')
    const revokeObjectURL = vi.fn()
    // jsdom does not implement object URLs; provide them for this test.
    ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = createObjectURL
    ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revokeObjectURL

    const click = vi.fn()
    const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)

    downloadCardFile(card, 'key-card-uuid-1-contact.json')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const [blob] = createObjectURL.mock.calls[0]
    expect(blob.type).toBe('application/json')
    expect(anchor.download).toBe('key-card-uuid-1-contact.json')
    expect(anchor.href).toBe('blob:mock')
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})

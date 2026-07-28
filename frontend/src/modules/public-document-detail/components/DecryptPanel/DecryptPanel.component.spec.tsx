import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { DECRYPT_RAW_KEY_LABEL, DECRYPT_SOURCE_RAW, DECRYPT_USE_KEY_BUTTON_LABEL } from 'modules/public-document-detail/constants/detail.consts.ts'

import { DecryptPanel } from './DecryptPanel.component'

const anchor: DocumentView = {
  tx_hash: 'tx-1',
  document_id: 'doc-1',
  organisation_id: 'org-1',
  ipfs_cid: 'bafy-1',
  content_hash: 'a'.repeat(64),
  plaintext_hash: 'b'.repeat(64),
  envelope_version: 1,
  slot_count: 2,
  recipient_key_hashes: [],
  slot: 12345,
  block_time: 1_700_000_000,
  checks: { manifest: 'PASS', ipfs: 'PASS', content_hash: 'PASS', envelope: 'PASS' },
  verdict: 'VERIFIED',
  created_at: '2026-07-14T00:00:00Z'
}

// useDecryptPanel's real fetchEnvelope default is only reached on a "Decrypt" click (I3); the
// component still consumes useGetDocumentEnvelopeModel (a useMutation), hence QueryClientProvider.
const renderPanel = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <DecryptPanel anchor={anchor} documentId="doc-1" />
    </QueryClientProvider>
  )
}

describe('DecryptPanel', () => {
  it('masks the raw-key field and clears it the instant the key is handed off (I1 hygiene)', async () => {
    const user = userEvent.setup()
    renderPanel()

    // The raw-key input lives behind the "Raw key" source selector; select it first.
    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))

    const rawKeyField = screen.getByLabelText(DECRYPT_RAW_KEY_LABEL) as HTMLInputElement
    expect(rawKeyField).toHaveAttribute('type', 'password')

    await user.type(rawKeyField, '11'.repeat(32))
    expect(rawKeyField.value).toBe('11'.repeat(32))

    await user.click(screen.getByRole('button', { name: DECRYPT_USE_KEY_BUTTON_LABEL }))

    expect(rawKeyField.value).toBe('')
  })
})

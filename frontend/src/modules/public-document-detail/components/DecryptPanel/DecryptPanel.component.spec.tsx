import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

import type { DocumentVerdict, DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { theme } from 'libs/ui-kit/theme/theme'
import {
  DECRYPT_IPFS_RETRYING_MESSAGE,
  DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL,
  DECRYPT_PENDING_MESSAGE,
  DECRYPT_RAW_KEY_LABEL,
  DECRYPT_SOURCE_PASSKEY,
  DECRYPT_SOURCE_RAW,
  DECRYPT_UNAVAILABLE_MESSAGE,
  DECRYPT_USE_KEY_BUTTON_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'

import { DecryptPanel } from './DecryptPanel.component'

vi.mock('libs/models/documents-model/GetDocumentEnvelope/GetDocumentEnvelope.service.ts', () => ({
  useGetDocumentEnvelopeModel: () => ({ fetchEnvelope: () => new Promise(() => {}) })
}))

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

// useDecryptPanel's real fetchEnvelope default is only reached on a "Decrypt" click; the
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
  it('masks the raw-key field and clears it the instant the key is handed off', async () => {
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

// The note is a ui-kit Alert, which reads the theme from both providers.
const panelFor = (panelAnchor: DocumentView, queryClient: QueryClient) => (
  <MuiThemeProvider theme={theme}>
    <StyledComponentsThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <DecryptPanel anchor={panelAnchor} documentId="doc-1" />
      </QueryClientProvider>
    </StyledComponentsThemeProvider>
  </MuiThemeProvider>
)

const renderPanelFor = (verdict: DocumentVerdict) => render(panelFor({ ...anchor, verdict }, new QueryClient()))

describe('DecryptPanel — only offered for VERIFIED anchors', () => {
  it.each([
    ['PENDING', DECRYPT_PENDING_MESSAGE],
    ['IPFS_UNAVAILABLE', DECRYPT_IPFS_RETRYING_MESSAGE],
    ['CONTENT_HASH_MISMATCH', DECRYPT_UNAVAILABLE_MESSAGE]
  ] as const)('disables every way to supply a key for a %s anchor and says why', (verdict, message) => {
    renderPanelFor(verdict)

    expect(screen.getByText(message)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL })).toBeDisabled()
    // The source selector too: otherwise "Raw key" opens a field whose key could never be used.
    expect(screen.getByRole('button', { name: DECRYPT_SOURCE_PASSKEY })).toBeDisabled()
    expect(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW })).toBeDisabled()
  })

  it('keeps every control enabled, with no note, for a VERIFIED anchor', () => {
    renderPanelFor('VERIFIED')

    expect(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL })).toBeEnabled()
    expect(screen.getByRole('button', { name: DECRYPT_SOURCE_PASSKEY })).toBeEnabled()
    expect(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW })).toBeEnabled()
    for (const message of [DECRYPT_PENDING_MESSAGE, DECRYPT_IPFS_RETRYING_MESSAGE, DECRYPT_UNAVAILABLE_MESSAGE]) {
      expect(screen.queryByText(message)).not.toBeInTheDocument()
    }
  })

  it('locks the raw-key form, and drops a typed key, when the user switches to a pending anchor', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()
    const { rerender } = render(panelFor(anchor, queryClient))

    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))
    await user.type(screen.getByLabelText(DECRYPT_RAW_KEY_LABEL), '11'.repeat(32))

    // Another anchor of the same document: the panel is re-rendered, not remounted.
    rerender(panelFor({ ...anchor, tx_hash: 'tx-2', verdict: 'PENDING' }, queryClient))

    const rawKeyField = screen.getByLabelText(DECRYPT_RAW_KEY_LABEL) as HTMLInputElement
    expect(rawKeyField).toBeDisabled()
    expect(rawKeyField.value).toBe('')
    expect(screen.getByRole('button', { name: DECRYPT_USE_KEY_BUTTON_LABEL })).toBeDisabled()
  })
})

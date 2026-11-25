import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { theme } from 'libs/ui-kit/theme/theme'
import {
  DECRYPT_DOWNLOAD_BUTTON_LABEL,
  DECRYPT_RAW_KEY_LABEL,
  DECRYPT_SOURCE_RAW,
  DECRYPT_USE_KEY_BUTTON_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'

import { DecryptPanel } from './DecryptPanel.component'

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])

// The crypto is covered by its own specs. Here "decrypting" yields a verified PDF, so the test can
// follow the panel from the Decrypt click to the file the browser is asked to save.
vi.mock('libs/document-vault-crypto/decrypt', () => ({
  decryptEnvelope: vi.fn(async () => ({ plaintext: PDF, recipientIndex: 0, plaintextHashHex: 'b'.repeat(64), plaintextHashMatches: true }))
}))
vi.mock('libs/models/documents-model/GetDocumentEnvelope/GetDocumentEnvelope.service.ts', () => ({
  useGetDocumentEnvelopeModel: () => ({ fetchEnvelope: async () => ({}) })
}))
// pdf.js needs a worker and a canvas that jsdom lacks; the preview is not what is under test.
vi.mock('modules/public-document-detail/utils/pdf.ts', () => ({ loadPdf: async () => null }))

const anchor: DocumentView = {
  tx_hash: 'tx-1',
  document_id: 'doc-1',
  organisation_id: 'org-1',
  ipfs_cid: 'bafy-1',
  content_hash: 'a'.repeat(64),
  plaintext_hash: 'b'.repeat(64),
  envelope_version: 1,
  recipient_count: 1,
  recipient_key_hashes: [],
  slot: 12345,
  block_time: 1_700_000_000,
  checks: { manifest: 'PASS', ipfs: 'PASS', content_hash: 'PASS', envelope: 'PASS' },
  verdict: 'VERIFIED',
  created_at: '2026-07-14T00:00:00Z'
}

describe('DecryptPanel — download', () => {
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL
  let saved: Array<{ download: string; type: string }>

  beforeEach(() => {
    saved = []
    let lastBlob: Blob | null = null
    URL.createObjectURL = vi.fn((blob: Blob) => {
      lastBlob = blob
      return 'blob:mock-url'
    })
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      saved.push({ download: this.download, type: lastBlob?.type ?? '' })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  })

  it('saves a verified PDF as document-<id>.pdf, not .bin', async () => {
    const user = userEvent.setup()
    render(
      <MuiThemeProvider theme={theme}>
        <StyledComponentsThemeProvider theme={theme}>
          <DecryptPanel anchor={anchor} documentId="doc-1" />
        </StyledComponentsThemeProvider>
      </MuiThemeProvider>
    )

    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))
    await user.type(screen.getByLabelText(DECRYPT_RAW_KEY_LABEL), '11'.repeat(32))
    await user.click(screen.getByRole('button', { name: DECRYPT_USE_KEY_BUTTON_LABEL }))
    await user.click(await screen.findByRole('button', { name: DECRYPT_DOWNLOAD_BUTTON_LABEL }))

    expect(saved).toEqual([{ download: 'document-doc-1.pdf', type: 'application/pdf' }])
  })
})

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import type { DecryptOutcome, Envelope } from 'libs/document-vault-crypto/decrypt'
import { theme } from 'libs/ui-kit/theme/theme'
import {
  DECRYPT_DECRYPTING_LABEL,
  DECRYPT_MATCH_MESSAGE,
  DECRYPT_NO_KEY_OPENS_MESSAGE,
  DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL,
  DECRYPT_RAW_KEY_INVALID,
  DECRYPT_RAW_KEY_LABEL,
  DECRYPT_SOURCE_PASSKEY,
  DECRYPT_SOURCE_RAW,
  DECRYPT_USE_KEY_BUTTON_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'

import { DecryptPanel } from './DecryptPanel.component'

// The crypto, the passkey ceremony and the envelope request each have their own specs. Here they are
// stand-ins, so the test can follow the panel from "here is my key" to what the user sees.
const mocks = vi.hoisted(() => ({
  fetchEnvelope: vi.fn(),
  decryptEnvelope: vi.fn(),
  deriveKeypairWithPasskey: vi.fn()
}))
vi.mock('libs/document-vault-crypto/decrypt', () => ({ decryptEnvelope: mocks.decryptEnvelope }))
vi.mock('libs/document-vault-crypto/passkey', () => ({ deriveKeypairWithPasskey: mocks.deriveKeypairWithPasskey }))
vi.mock('libs/models/documents-model/GetDocumentEnvelope/GetDocumentEnvelope.service.ts', () => ({
  useGetDocumentEnvelopeModel: () => ({ fetchEnvelope: mocks.fetchEnvelope })
}))
// pdf.js needs a worker and a canvas that jsdom lacks; the decrypted file here is text anyway.
vi.mock('modules/public-document-detail/utils/pdf.ts', () => ({ loadPdf: async () => null }))

const RAW_KEY = '11'.repeat(32)
const SECOND_RAW_KEY = '22'.repeat(32)
const PASSKEY_KEY = '33'.repeat(32)
const PLAINTEXT_HASH = 'b'.repeat(64)
// The button this change removes. Spelled out because its constant goes with it.
const REMOVED_DECRYPT_BUTTON = 'Decrypt'

const anchor: DocumentView = {
  tx_hash: 'tx-1',
  document_id: 'doc-1',
  organisation_id: 'org-1',
  ipfs_cid: 'bafy-1',
  content_hash: 'a'.repeat(64),
  plaintext_hash: PLAINTEXT_HASH,
  envelope_version: 1,
  recipient_count: 1,
  recipient_key_hashes: [],
  slot: 12345,
  block_time: 1_700_000_000,
  checks: { manifest: 'PASS', ipfs: 'PASS', content_hash: 'PASS', envelope: 'PASS' },
  verdict: 'VERIFIED',
  created_at: '2026-07-14T00:00:00Z'
}

const envelope: Envelope = {
  version: 1,
  type: 'REEVE_ENCRYPTED_DOCUMENT',
  content_hash: 'a'.repeat(64),
  plaintext_hash: PLAINTEXT_HASH,
  payload: { ciphertext: 'AA==', nonce: '00'.repeat(12) },
  slots: []
}

const outcome: DecryptOutcome = {
  plaintext: new TextEncoder().encode('quarterly report'),
  recipientIndex: 0,
  plaintextHashHex: PLAINTEXT_HASH,
  plaintextHashMatches: true
}

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const panelFor = (panelAnchor: DocumentView) => (
  <MuiThemeProvider theme={theme}>
    <StyledComponentsThemeProvider theme={theme}>
      <DecryptPanel anchor={panelAnchor} documentId="doc-1" />
    </StyledComponentsThemeProvider>
  </MuiThemeProvider>
)

const renderPanel = () => render(panelFor(anchor))

const presentRawKey = async (user: ReturnType<typeof userEvent.setup>, key: string) => {
  await user.type(screen.getByLabelText(DECRYPT_RAW_KEY_LABEL), key)
  await user.click(screen.getByRole('button', { name: DECRYPT_USE_KEY_BUTTON_LABEL }))
}

describe('DecryptPanel — decrypts as soon as a key is presented', () => {
  beforeEach(() => {
    mocks.fetchEnvelope.mockReset().mockResolvedValue(envelope)
    mocks.decryptEnvelope.mockReset().mockResolvedValue(outcome)
    mocks.deriveKeypairWithPasskey.mockReset().mockResolvedValue({ privateKeyHex: PASSKEY_KEY, publicKeyHex: 'c'.repeat(64), credentialId: 'cred-1' })
  })

  it('decrypts with a raw key on "Use this key", with no Decrypt button', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))
    await presentRawKey(user, RAW_KEY)

    expect(await screen.findByText(DECRYPT_MATCH_MESSAGE)).toBeInTheDocument()
    expect(screen.getByText('quarterly report')).toBeInTheDocument()
    expect(mocks.fetchEnvelope).toHaveBeenCalledTimes(1)
    expect(mocks.decryptEnvelope).toHaveBeenCalledWith(RAW_KEY, envelope, PLAINTEXT_HASH)
    expect(screen.queryByRole('button', { name: REMOVED_DECRYPT_BUTTON })).not.toBeInTheDocument()
  })

  it('decrypts with the passkey-derived key as soon as the passkey unlocks', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL }))

    expect(await screen.findByText(DECRYPT_MATCH_MESSAGE)).toBeInTheDocument()
    expect(screen.getByText('quarterly report')).toBeInTheDocument()
    expect(mocks.deriveKeypairWithPasskey).toHaveBeenCalledTimes(1)
    expect(mocks.fetchEnvelope).toHaveBeenCalledTimes(1)
    expect(mocks.decryptEnvelope).toHaveBeenCalledWith(PASSKEY_KEY, envelope, PLAINTEXT_HASH)
    expect(screen.queryByRole('button', { name: REMOVED_DECRYPT_BUTTON })).not.toBeInTheDocument()
  })

  it('shows that it is decrypting, not a Decrypt button, while the envelope loads', async () => {
    const pending = deferred<Envelope>()
    mocks.fetchEnvelope.mockReturnValue(pending.promise)
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL }))

    expect(await screen.findByRole('status')).toHaveTextContent(DECRYPT_DECRYPTING_LABEL)
    expect(screen.queryByRole('button', { name: REMOVED_DECRYPT_BUTTON })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL })).toBeDisabled()
    expect(screen.getByRole('button', { name: DECRYPT_SOURCE_PASSKEY })).toBeDisabled()

    await act(async () => {
      pending.resolve(envelope)
    })
    expect(await screen.findByText(DECRYPT_MATCH_MESSAGE)).toBeInTheDocument()
  })

  it('lets the passkey unlock another anchor while the previous anchor is still loading', async () => {
    const pending = deferred<Envelope>()
    mocks.fetchEnvelope.mockReturnValue(pending.promise)
    const user = userEvent.setup()
    const { rerender } = renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL }))
    expect(await screen.findByRole('status')).toHaveTextContent(DECRYPT_DECRYPTING_LABEL)

    // Another VERIFIED anchor of the same document: the panel is re-rendered, not remounted.
    rerender(panelFor({ ...anchor, tx_hash: 'tx-2' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL })).toBeEnabled()

    // The first anchor's envelope arriving late changes nothing on screen.
    await act(async () => {
      pending.resolve(envelope)
    })
    expect(screen.queryByText(DECRYPT_MATCH_MESSAGE)).not.toBeInTheDocument()
  })

  it('locks the raw-key field while a raw key is being tried', async () => {
    const pending = deferred<Envelope>()
    mocks.fetchEnvelope.mockReturnValue(pending.promise)
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))
    await presentRawKey(user, RAW_KEY)

    expect(await screen.findByRole('status')).toHaveTextContent(DECRYPT_DECRYPTING_LABEL)
    expect(screen.getByLabelText(DECRYPT_RAW_KEY_LABEL)).toBeDisabled()

    await act(async () => {
      pending.resolve(envelope)
    })
    expect(await screen.findByText(DECRYPT_MATCH_MESSAGE)).toBeInTheDocument()
  })

  it('says when a key opens nothing, and lets the user try another key straight away', async () => {
    mocks.decryptEnvelope.mockReset().mockResolvedValueOnce(null).mockResolvedValue(outcome)
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))
    await presentRawKey(user, RAW_KEY)

    expect(await screen.findByText(DECRYPT_NO_KEY_OPENS_MESSAGE)).toBeInTheDocument()
    expect(screen.getByLabelText(DECRYPT_RAW_KEY_LABEL)).toBeEnabled()

    await presentRawKey(user, SECOND_RAW_KEY)

    expect(await screen.findByText(DECRYPT_MATCH_MESSAGE)).toBeInTheDocument()
    expect(mocks.decryptEnvelope).toHaveBeenLastCalledWith(SECOND_RAW_KEY, envelope, PLAINTEXT_HASH)
  })

  it('fetches nothing for a raw key that is not 64 hex characters', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: DECRYPT_SOURCE_RAW }))
    await presentRawKey(user, 'not-hex')

    expect(await screen.findByText(DECRYPT_RAW_KEY_INVALID)).toBeInTheDocument()
    expect(mocks.fetchEnvelope).not.toHaveBeenCalled()
  })
})

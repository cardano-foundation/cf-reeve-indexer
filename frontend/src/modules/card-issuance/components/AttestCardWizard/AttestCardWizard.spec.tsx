import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { KeyCard } from 'libs/document-vault-crypto/cards'
import { useAttestCardCeremony } from 'libs/models/cards-model/AttestCardCeremony/AttestCardCeremony.service'
import { theme } from 'libs/ui-kit/theme/theme'
import {
  ATTEST_AGENT_OOBI_PENDING,
  ATTEST_AGENT_OOBI_QR_LABEL,
  ATTEST_COPY_OOBI_LABEL,
  ATTEST_PAIR_BUTTON_LABEL,
  ATTEST_SCAN_WALLET_OOBI_LABEL,
  ATTEST_WALLET_OOBI_LABEL
} from 'modules/card-issuance/constants/attestation.consts'

import { AttestCardWizard } from './AttestCardWizard.component'

vi.mock('libs/models/cards-model/AttestCardCeremony/AttestCardCeremony.service', () => ({ useAttestCardCeremony: vi.fn() }))

// The camera is covered by QrScannerDialog's own spec. Here the stub stands in for "the user scanned
// something" — and renders only while open, so the test also proves the icon really opens it.
vi.mock('libs/ui-kit/components/QrScannerDialog/QrScannerDialog.component', () => ({
  QrScannerDialog: ({ open, onScan, onClose }: { open: boolean; onScan: (text: string) => void; onClose: () => void }) =>
    open ? (
      <>
        <button type="button" onClick={() => onScan('http://wallet.example/oobi/EWALLET')}>
          simulate scan
        </button>
        <button type="button" onClick={onClose}>
          simulate cancel
        </button>
      </>
    ) : null
}))

// Records the value the QR encodes, so the test checks WHAT is shown, not merely that an image exists.
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <svg data-testid="qr-code" data-value={value} />
}))

const AGENT_OOBI = 'http://indexer.example/oobi/EAGENT/agent/EAGENTPRE'
const SCANNED_OOBI = 'http://wallet.example/oobi/EWALLET'

const CARD: KeyCard = {
  v: 1,
  type: 'REEVE_KEY_CARD',
  subject: { subjectType: 'EXTERNAL', subjectId: 'subject-1', organisationId: '' },
  key: { publicKey: 'ab'.repeat(32), assurance: 'PASSKEY', createdAt: '2026-11-03T00:00:00Z' }
}

type CeremonyModel = ReturnType<typeof useAttestCardCeremony>

const pairingCeremony = (agentOobi: string | null, pair: CeremonyModel['pair']): CeremonyModel => ({
  ceremony: {
    ceremony_id: 'ceremony-1',
    card_id: 'card-1',
    state: 'CREATED',
    agent_oobi: agentOobi,
    card: null,
    presented_credential: null,
    error_title: null,
    error_detail: null
  },
  createCeremony: vi.fn(),
  pair,
  present: vi.fn(),
  attest: vi.fn(),
  reset: vi.fn(),
  isCreating: false,
  isPairing: false,
  isPresenting: false,
  isAttesting: false,
  isBusy: false,
  requestError: null
})

const renderWizard = () =>
  render(
    <MuiThemeProvider theme={theme}>
      <StyledComponentsThemeProvider theme={theme}>
        <AttestCardWizard card={CARD} onClose={vi.fn()} />
      </StyledComponentsThemeProvider>
    </MuiThemeProvider>
  )

describe('AttestCardWizard — pairing step', () => {
  let pair: ReturnType<typeof vi.fn>

  beforeEach(() => {
    pair = vi.fn()
    vi.mocked(useAttestCardCeremony).mockReturnValue(pairingCeremony(AGENT_OOBI, pair))
  })

  it('renders the indexer OOBI as a QR code', () => {
    renderWizard()

    const qr = screen.getByRole('img', { name: ATTEST_AGENT_OOBI_QR_LABEL })
    expect(qr.querySelector('[data-testid="qr-code"]')).toHaveAttribute('data-value', AGENT_OOBI)
    // The copyable text stays — some users paste the OOBI into the wallet instead of scanning.
    expect(screen.getByText(AGENT_OOBI)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: ATTEST_COPY_OOBI_LABEL })).toBeInTheDocument()
  })

  it('shows no QR while the agent OOBI is pending', () => {
    vi.mocked(useAttestCardCeremony).mockReturnValue(pairingCeremony(null, pair))

    renderWizard()

    expect(screen.queryByRole('img', { name: ATTEST_AGENT_OOBI_QR_LABEL })).not.toBeInTheDocument()
    expect(screen.getByText(ATTEST_AGENT_OOBI_PENDING)).toBeInTheDocument()
  })

  it('fills the wallet OOBI from a scan without pairing', async () => {
    const user = userEvent.setup()
    renderWizard()

    expect(screen.queryByRole('button', { name: 'simulate scan' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: ATTEST_SCAN_WALLET_OOBI_LABEL }))
    await user.click(screen.getByRole('button', { name: 'simulate scan' }))

    expect(screen.getByLabelText(ATTEST_WALLET_OOBI_LABEL)).toHaveValue(SCANNED_OOBI)
    expect(screen.queryByRole('button', { name: 'simulate scan' })).not.toBeInTheDocument()
    // A scan only fills the field: the user reviews it and pairs explicitly.
    expect(pair).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: ATTEST_PAIR_BUTTON_LABEL }))
    expect(pair).toHaveBeenCalledWith(SCANNED_OOBI)
  })

  it('closes the scanner on cancel and leaves the typed OOBI untouched', async () => {
    const user = userEvent.setup()
    renderWizard()
    const field = screen.getByLabelText(ATTEST_WALLET_OOBI_LABEL)
    await user.type(field, 'http://typed.example/oobi/ETYPED')

    await user.click(screen.getByRole('button', { name: ATTEST_SCAN_WALLET_OOBI_LABEL }))
    await user.click(screen.getByRole('button', { name: 'simulate cancel' }))

    // Cancel must really close it — otherwise the holder is stuck in a modal and cannot fall back to typing.
    expect(screen.queryByRole('button', { name: 'simulate cancel' })).not.toBeInTheDocument()
    expect(field).toHaveValue('http://typed.example/oobi/ETYPED')
    await user.type(field, '?x')
    expect(field).toHaveValue('http://typed.example/oobi/ETYPED?x')
    expect(pair).not.toHaveBeenCalled()
  })

  it('still pairs with a typed OOBI', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.type(screen.getByLabelText(ATTEST_WALLET_OOBI_LABEL), '  http://typed.example/oobi/ETYPED  ')
    await user.click(screen.getByRole('button', { name: ATTEST_PAIR_BUTTON_LABEL }))

    expect(pair).toHaveBeenCalledWith('http://typed.example/oobi/ETYPED')
  })
})

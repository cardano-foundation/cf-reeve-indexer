import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGLEIFVerification } from 'libs/hooks/useGLEIFVerification'
import { verifyColors } from 'libs/ui-kit/theme/colors.ts'
import { theme } from 'libs/ui-kit/theme/theme'

import { IdentityAttestationBadge } from './IdentityAttestationBadge.component'

// The badge renders via `t({ id })` (react-intl). Rather than requiring a real <IntlProvider> (no
// spec in this repo wraps one - see useFieldTransactionNumbersValidation.spec.ts /
// useFieldBlockchainHashValidation.spec.ts, which mock this same hook instead), stub it to echo the
// message id back. That keeps assertions deterministic and decoupled from copy changes while still
// letting each branch (schema-name fallback, GLEIF vs. generic claims, tx-hash labels) be asserted
// distinctly.
vi.mock('libs/translations/hooks/useTranslations.ts', () => ({
  useTranslations: () => ({
    t: ({ id }: { id: string }) => id
  })
}))

// The badge always calls useGLEIFVerification(lei) (react-query's `enabled` flag only gates the
// network fetch, not the hook call itself), and the real hook hits the live GLEIF API. Mock the
// whole module so tests never touch the network and can control the GLEIF result deterministically.
vi.mock('libs/hooks/useGLEIFVerification', () => ({
  useGLEIFVerification: vi.fn()
}))

const mockUseGLEIFVerification = vi.mocked(useGLEIFVerification)

type GLEIFResult = ReturnType<typeof useGLEIFVerification>

const gleifResult = (data: unknown, isLoading = false) => ({ data, isLoading }) as unknown as GLEIFResult

const NOT_VERIFIED_COLOR = theme.palette.grey[400]

type BadgeProps = Parameters<typeof IdentityAttestationBadge>[0]

// The badge nests a styled-components `Tooltip` (Tooltip.styles.tsx reads `theme.palette`/`theme.shape`
// off a styled-components ThemeContext) inside an MUI `Tooltip` (colors come off `useTheme()`, MUI's own
// theme context). App.tsx wires both providers with the same app `theme` around every route; mirror that
// minimal stack here rather than inventing a bespoke one.
const renderBadge = (props: BadgeProps) =>
  render(
    <MuiThemeProvider theme={theme}>
      <StyledComponentsThemeProvider theme={theme}>
        <IdentityAttestationBadge {...props} />
      </StyledComponentsThemeProvider>
    </MuiThemeProvider>
  )

const getTrigger = (container: HTMLElement, label: string) => container.querySelector(`[aria-label="${label}"]`) as HTMLElement

describe('IdentityAttestationBadge', () => {
  beforeEach(() => {
    mockUseGLEIFVerification.mockReturnValue(gleifResult(undefined))
  })

  it('renders the verified color when isVerified is true', () => {
    const { container } = renderBadge({ isVerified: true, schemaName: 'vLEI Legal Entity' })

    const path = container.querySelector('svg path')
    expect(path).toHaveAttribute('fill', verifyColors.blue[600])
  })

  it('renders a neutral color when isVerified is false', () => {
    const { container } = renderBadge({ isVerified: false, schemaName: 'vLEI Legal Entity' })

    const path = container.querySelector('svg path')
    expect(path).toHaveAttribute('fill', NOT_VERIFIED_COLOR)
  })

  it('shows the schema name as the tooltip headline when schemaName is provided', async () => {
    const user = userEvent.setup()
    const { container } = renderBadge({ isVerified: true, schemaName: 'vLEI Legal Entity', schemaSaid: 'ESaidShouldNotBeUsed' })

    await user.hover(getTrigger(container, 'vLEI Legal Entity'))

    expect(await screen.findByText('vLEI Legal Entity')).toBeInTheDocument()
    expect(screen.queryByText('ESaidShouldNotBeUsed')).not.toBeInTheDocument()
  })

  it('falls back to schemaSaid as the tooltip headline when schemaName is absent', async () => {
    const user = userEvent.setup()
    const { container } = renderBadge({ isVerified: true, schemaSaid: 'EAbc123SchemaSaid' })

    await user.hover(getTrigger(container, 'EAbc123SchemaSaid'))

    expect(await screen.findByText('EAbc123SchemaSaid')).toBeInTheDocument()
  })

  it('falls back to the generic verified-credential copy when neither schemaName nor schemaSaid is provided', async () => {
    const user = userEvent.setup()
    const { container } = renderBadge({ isVerified: true })

    await user.hover(getTrigger(container, 'verifiedCredential'))

    expect(await screen.findByText('verifiedCredential')).toBeInTheDocument()
  })

  it('runs the GLEIF cross-check and shows the LEI when a lei is provided', async () => {
    mockUseGLEIFVerification.mockReturnValue(
      gleifResult({
        legalName: 'Acme Corp',
        legalAddress: { city: 'Zug', country: 'CH' },
        entityStatus: 'ACTIVE'
      })
    )
    const user = userEvent.setup()
    const { container } = renderBadge({ isVerified: true, schemaName: 'vLEI Legal Entity', lei: '5493001KJTIIGC8Y1R12' })

    await user.hover(getTrigger(container, 'vLEI Legal Entity'))

    expect(mockUseGLEIFVerification).toHaveBeenCalledWith('5493001KJTIIGC8Y1R12')
    expect(await screen.findByText('LEI:')).toBeInTheDocument()
    expect(screen.getByText('5493001KJTIIGC8Y1R12')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    // GLEIF panel replaces the generic claims list entirely.
    expect(screen.queryByText('claims')).not.toBeInTheDocument()
  })

  it('shows a loading state while the GLEIF cross-check is in flight', async () => {
    mockUseGLEIFVerification.mockReturnValue(gleifResult(undefined, true))
    const user = userEvent.setup()
    const { container } = renderBadge({ isVerified: true, schemaName: 'vLEI Legal Entity', lei: '5493001KJTIIGC8Y1R12' })

    await user.hover(getTrigger(container, 'vLEI Legal Entity'))

    expect(await screen.findByText('verifyingLEI')).toBeInTheDocument()
    expect(screen.queryByText('leiRegistered')).not.toBeInTheDocument()
  })

  it('does not render the GLEIF panel and instead shows generic claims when lei is absent', async () => {
    const user = userEvent.setup()
    const { container } = renderBadge({
      isVerified: true,
      schemaName: 'Foundation Employee',
      claims: { engagementContextRole: 'Engineer', department: 'R&D', firstName: 'Ada', lastName: 'Lovelace' }
    })

    await user.hover(getTrigger(container, 'Foundation Employee'))

    expect(mockUseGLEIFVerification).toHaveBeenCalledWith(undefined)
    expect(await screen.findByText('claims')).toBeInTheDocument()
    // Labelled, not raw keys: a person reads "Role", not "engagementContextRole".
    expect(screen.getByText('Role:')).toBeInTheDocument()
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByText('First name:')).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    // An unknown key still renders, humanised rather than dropped.
    expect(screen.getByText('Department:')).toBeInTheDocument()
    expect(screen.getByText('R&D')).toBeInTheDocument()
    expect(screen.queryByText('LEI:')).not.toBeInTheDocument()
  })

  it('orders a Foundation Employee credential by what a person reads first, not by serialisation order', async () => {
    const user = userEvent.setup()
    const { container } = renderBadge({
      isVerified: true,
      schemaName: 'Foundation Employee',
      // deliberately the least useful field first, as an issuer might well serialise it
      claims: { department: 'R&D', engagementContextRole: 'Engineer', firstName: 'Ada' }
    })

    await user.hover(getTrigger(container, 'Foundation Employee'))

    const labels = (await screen.findAllByText(/^(First name|Role|Department):$/)).map((node) => node.textContent)
    expect(labels).toEqual(['First name:', 'Role:', 'Department:'])
  })

  it('shows the no-additional-claims copy when lei is absent and claims is empty', async () => {
    const user = userEvent.setup()
    const { container } = renderBadge({ isVerified: true, schemaName: 'Foundation Employee', claims: {} })

    await user.hover(getTrigger(container, 'Foundation Employee'))

    expect(await screen.findByText('noAdditionalClaims')).toBeInTheDocument()
  })

  it('renders tx hash and credential tx hash links for any schema when provided', async () => {
    const txHash = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
    const credentialTxHash = 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1'
    const user = userEvent.setup()
    const { container } = renderBadge({
      isVerified: true,
      schemaName: 'Foundation Employee',
      txHash,
      credentialTxHash
    })

    await user.hover(getTrigger(container, 'Foundation Employee'))

    expect(await screen.findByText('attestationTxHash:')).toBeInTheDocument()
    expect(screen.getByText('credentialTxHash:')).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', `https://explorer.cardano.org/transaction/${txHash}`)
    expect(links[1]).toHaveAttribute('href', `https://explorer.cardano.org/transaction/${credentialTxHash}`)
  })
})

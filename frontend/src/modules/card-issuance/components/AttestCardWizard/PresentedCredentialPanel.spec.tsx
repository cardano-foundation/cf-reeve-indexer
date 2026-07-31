import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { theme } from 'libs/ui-kit/theme/theme'

import { PresentedCredentialPanel } from './PresentedCredentialPanel.component'

type PanelProps = Parameters<typeof PresentedCredentialPanel>[0]

const renderPanel = (credential: PanelProps['credential']) =>
  render(
    <MuiThemeProvider theme={theme}>
      <PresentedCredentialPanel credential={credential} />
    </MuiThemeProvider>
  )

const FOUNDATION_EMPLOYEE: PanelProps['credential'] = {
  credential_said: 'ECRED1',
  schema_said: 'ESCHEMA1',
  schema_name: 'Foundation Employee',
  issuer_aid: 'EISSUER1',
  claims: { firstName: 'Ada', lastName: 'Lovelace', engagementContextRole: 'Engineer' }
}

describe('PresentedCredentialPanel', () => {
  it('renders a Foundation Employee credential’s own attributes, with readable labels', () => {
    // The point of the panel: a person about to sign an attestation sees WHO the wallet just presented
    // as, not an opaque SAID.
    renderPanel(FOUNDATION_EMPLOYEE)

    expect(screen.getByText('Foundation Employee')).toBeDefined()
    expect(screen.getByText('Ada')).toBeDefined()
    expect(screen.getByText('Lovelace')).toBeDefined()
    expect(screen.getByText('Engineer')).toBeDefined()
    // camelCase attribute names are humanised rather than shown raw.
    expect(screen.getByText('Engagement context role:')).toBeDefined()
  })

  it('renders any other schema’s claims the same way, with no schema-specific code', () => {
    // A vLEI goes through the identical generic path — adding a schema is a registry entry on the
    // indexer, never a change here.
    renderPanel({ ...FOUNDATION_EMPLOYEE, schema_name: 'vLEI', claims: { LEI: '5493001KJTIIGC8Y1R12' } })

    expect(screen.getByText('vLEI')).toBeDefined()
    expect(screen.getByText('5493001KJTIIGC8Y1R12')).toBeDefined()
  })

  it('never claims the credential is verified', () => {
    // The indexer is permissionless and does not check the issuer, trust chain or revocation state.
    // If this ever fails because the copy gained the word "verified", the copy is wrong — not the test.
    const { container } = renderPanel(FOUNDATION_EMPLOYEE)

    expect(container.textContent?.toLowerCase()).not.toContain('verified')
    expect(container.textContent).toContain('does not verify it')
  })

  it('falls back to the raw schema SAID for a schema the indexer does not recognise', () => {
    // An unconfigured schema is a legitimate presentation here, not an error — so it must still render.
    renderPanel({ ...FOUNDATION_EMPLOYEE, schema_name: null, schema_said: 'EUNKNOWNSCHEMA' })

    expect(screen.getByText('Unrecognised credential type')).toBeDefined()
    expect(screen.getByText('EUNKNOWNSCHEMA')).toBeDefined()
  })

  it('says so explicitly when the credential carries no attributes of its own', () => {
    renderPanel({ ...FOUNDATION_EMPLOYEE, claims: {} })

    expect(screen.getByText('This credential carries no additional details.')).toBeDefined()
  })

  it('stringifies a nested claim rather than dropping it', () => {
    // A blank row would read as "the credential says nothing about that", which is a different claim.
    renderPanel({ ...FOUNDATION_EMPLOYEE, claims: { address: { city: 'Zug' } } })

    expect(screen.getByText('{"city":"Zug"}')).toBeDefined()
  })
})

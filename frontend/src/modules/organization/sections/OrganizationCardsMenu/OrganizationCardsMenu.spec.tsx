import { render, screen } from '@testing-library/react'

import * as permissions from 'libs/permissions/has-permission'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { OrganizationCardsMenu } from 'modules/organization/sections/OrganizationCardsMenu/OrganizationCardsMenu.component.tsx'

const OrganizationCardsMenuWithProviders = () => {
  return (
    <TestWrapper>
      <OrganizationCardsMenu />
    </TestWrapper>
  )
}

describe('OrganizationCardsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders all the cards when permissions are granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(true)

    render(<OrganizationCardsMenuWithProviders />)

    expect(screen.getByRole('heading', { name: 'Organization details' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Chart of accounts' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cost centers' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'VAT codes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Event codes' })).toBeInTheDocument()
  })
  it('renders no cards when permissions are not granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(false)

    render(<OrganizationCardsMenuWithProviders />)

    expect(screen.queryByRole('heading', { name: 'Organization details' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Chart of accounts' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Cost centers' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'VAT codes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Event codes' })).not.toBeInTheDocument()
  })
})

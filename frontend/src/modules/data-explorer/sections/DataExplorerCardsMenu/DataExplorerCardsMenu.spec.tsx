import { render, screen } from '@testing-library/react'

import * as permissions from 'libs/permissions/has-permission'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { DataExplorerCardsMenu } from 'modules/data-explorer/sections/DataExplorerCardsMenu/DataExplorerCardsMenu.component.tsx'

const DataExplorerCardsMenuWithProviders = () => {
  return (
    <TestWrapper>
      <DataExplorerCardsMenu />
    </TestWrapper>
  )
}

describe('DataExplorerCardsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders all the cards when permissions are granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(true)
    render(<DataExplorerCardsMenuWithProviders />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('View financial dashboard')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Extraction' })).toBeInTheDocument()
    expect(screen.getByText('Retrieve published transactions')).toBeInTheDocument()
  })

  it('renders no the cards when permissions are not granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(false)
    render(<DataExplorerCardsMenuWithProviders />)

    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByText('View financial dashboard')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Extraction' })).not.toBeInTheDocument()
    expect(screen.queryByText('Retrieve published transactions')).not.toBeInTheDocument()
  })
})

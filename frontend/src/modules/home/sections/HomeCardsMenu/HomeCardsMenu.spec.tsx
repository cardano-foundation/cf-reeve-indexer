import { render, screen } from '@testing-library/react'

import * as permissions from 'libs/permissions/has-permission'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { HomeCardsMenu } from 'modules/home/sections/HomeCardsMenu/HomeCardsMenu.component.tsx'

const HomeCardsMenuWithProviders = () => {
  return (
    <TestWrapper>
      <HomeCardsMenu />
    </TestWrapper>
  )
}

describe('HomeCardsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders all the cards when permissions are granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(true)
    render(<HomeCardsMenuWithProviders />)

    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument()
    expect(screen.getByText('Import, review and publish accounting transactions.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Data explorer' })).toBeInTheDocument()
    expect(screen.getByText('Analyze dashboards and access published transactions')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reporting' })).toBeInTheDocument()
    expect(screen.getByText('Create and publish financial reports')).toBeInTheDocument()
  })
  it('renders no the cards when permissions are not granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(false)
    render(<HomeCardsMenuWithProviders />)

    expect(screen.queryByRole('heading', { name: 'Transactions' })).not.toBeInTheDocument()
    expect(screen.queryByText('Import, review and publish accounting transactions.')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Data explorer' })).not.toBeInTheDocument()
    expect(screen.queryByText('Analyze dashboards and access published transactions')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reporting' })).not.toBeInTheDocument()
    expect(screen.queryByText('Create and publish financial reports')).not.toBeInTheDocument()
  })
})

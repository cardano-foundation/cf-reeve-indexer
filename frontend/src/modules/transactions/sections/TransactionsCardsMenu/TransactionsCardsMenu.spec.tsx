import { render, screen } from '@testing-library/react'

import * as permissions from 'libs/permissions/has-permission'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TransactionsCardsMenu } from 'modules/transactions/sections/TransactionsCardsMenu/TransactionsCardsMenu.component.tsx'

const TransactionsCardsMenuWithProviders = () => {
  return (
    <TestWrapper>
      <TransactionsCardsMenu />
    </TestWrapper>
  )
}

describe('TransactionsCardsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders all the cards when permissions are granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(true)

    render(<TransactionsCardsMenuWithProviders />)

    expect(screen.getByRole('heading', { name: 'Import' })).toBeInTheDocument()
    expect(screen.getByText('Add accounting transactions')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(screen.getByText('Check the imported data batches')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByText('Submit transactions to the blockchain')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reconciliation' })).toBeInTheDocument()
    expect(screen.getByText('Reconcile published transactions with source data')).toBeInTheDocument()
  })
  it('renders no cards when permissions are not granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(false)

    render(<TransactionsCardsMenuWithProviders />)

    expect(screen.queryByRole('heading', { name: 'Import' })).not.toBeInTheDocument()
    expect(screen.queryByText('Add accounting transactions')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Review' })).not.toBeInTheDocument()
    expect(screen.queryByText('Check the imported data batches')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByText('Submit transactions to the blockchain')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reconciliation' })).not.toBeInTheDocument()
    expect(screen.queryByText('Reconcile published transactions with source data')).not.toBeInTheDocument()
  })
})
